//! CP Tracker — phần chạy trên máy (Rust).
//! Dữ liệu là một file JSON (`cp-tracker.json`) trong thư mục dữ liệu, kèm bản sao lưu mỗi ngày.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

const DB_FILE: &str = "cp-tracker.json";
const SETTINGS_FILE: &str = "settings.json";
const KEEP_BACKUPS: usize = 14;
/// Only these sites are contacted (problem titles, difficulty, tags).
const ALLOWED_HOSTS: &[&str] = &[
    "codeforces.com",
    "kenkoooo.com",
    "atcoder.jp",
    "dmoj.ca",
    "oj.vnoi.info",
    "www.codechef.com",
    "oj.uz",
    "csacademy.com",
];

#[derive(Serialize, Deserialize, Default)]
struct Settings {
    data_dir: Option<String>,
}

#[derive(Serialize)]
struct Info {
    data_dir: String,
    db_path: String,
    backup_dir: String,
    version: String,
}

fn err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(err)?;
    fs::create_dir_all(&dir).map_err(err)?;
    Ok(dir.join(SETTINGS_FILE))
}

fn read_settings(app: &AppHandle) -> Settings {
    settings_path(app)
        .ok()
        .and_then(|p| fs::read_to_string(p).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn write_settings(app: &AppHandle, s: &Settings) -> Result<(), String> {
    let p = settings_path(app)?;
    fs::write(p, serde_json::to_string_pretty(s).map_err(err)?).map_err(err)
}

fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = match read_settings(app).data_dir {
        Some(d) if !d.is_empty() => PathBuf::from(d),
        _ => app.path().app_data_dir().map_err(err)?,
    };
    fs::create_dir_all(&dir).map_err(err)?;
    Ok(dir)
}

/// Write through a temporary file so a crash never leaves a half-written database.
fn atomic_write(path: &Path, content: &str) -> Result<(), String> {
    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, content).map_err(err)?;
    fs::rename(&tmp, path).map_err(err)
}

/// Keep one copy of the database per day (the first save of the day), at most KEEP_BACKUPS files.
fn daily_backup(dir: &Path) -> Result<(), String> {
    let db = dir.join(DB_FILE);
    if !db.exists() {
        return Ok(());
    }
    let bdir = dir.join("backups");
    fs::create_dir_all(&bdir).map_err(err)?;
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let target = bdir.join(format!("cp-tracker-{today}.json"));
    if !target.exists() {
        fs::copy(&db, &target).map_err(err)?;
    }
    let mut files: Vec<PathBuf> = fs::read_dir(&bdir)
        .map_err(err)?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map(|n| n.starts_with("cp-tracker-") && n.ends_with(".json"))
                .unwrap_or(false)
        })
        .collect();
    files.sort();
    while files.len() > KEEP_BACKUPS {
        let _ = fs::remove_file(files.remove(0));
    }
    Ok(())
}

#[tauri::command]
fn info(app: AppHandle) -> Result<Info, String> {
    let dir = data_dir(&app)?;
    Ok(Info {
        db_path: dir.join(DB_FILE).to_string_lossy().into_owned(),
        backup_dir: dir.join("backups").to_string_lossy().into_owned(),
        data_dir: dir.to_string_lossy().into_owned(),
        version: app.package_info().version.to_string(),
    })
}

#[tauri::command]
fn load_db(app: AppHandle) -> Result<String, String> {
    let p = data_dir(&app)?.join(DB_FILE);
    if !p.exists() {
        return Ok(String::new());
    }
    fs::read_to_string(p).map_err(err)
}

#[tauri::command]
fn save_db(app: AppHandle, json: String) -> Result<(), String> {
    // refuse to overwrite the database with something that is not valid JSON
    serde_json::from_str::<serde_json::Value>(&json).map_err(err)?;
    let dir = data_dir(&app)?;
    daily_backup(&dir)?;
    atomic_write(&dir.join(DB_FILE), &json)
}

#[tauri::command]
async fn fetch_text(url: String) -> Result<String, String> {
    let parsed = reqwest::Url::parse(&url).map_err(err)?;
    let host = parsed.host_str().unwrap_or("");
    if parsed.scheme() != "https" || !ALLOWED_HOSTS.contains(&host) {
        return Err(format!("host not allowed: {host}"));
    }
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) CP-Tracker/0.1")
        .timeout(Duration::from_secs(40))
        .build()
        .map_err(err)?;
    let res = client.get(parsed).send().await.map_err(err)?;
    let status = res.status();
    let body = res.text().await.map_err(err)?;
    if !status.is_success() && !body.trim_start().starts_with('{') {
        return Err(format!("HTTP {}", status.as_u16()));
    }
    Ok(body)
}

#[tauri::command]
fn open_url(app: AppHandle, url: String) -> Result<(), String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("only http(s) links can be opened".into());
    }
    app.opener().open_url(url, None::<&str>).map_err(err)
}

#[tauri::command]
fn open_data_dir(app: AppHandle) -> Result<(), String> {
    let dir = data_dir(&app)?;
    app.opener()
        .open_path(dir.to_string_lossy(), None::<&str>)
        .map_err(err)
}

/// Save dialog → write `content` to the chosen file. Returns the path, or None when cancelled.
#[tauri::command]
async fn save_file_dialog(app: AppHandle, default_name: String, content: String) -> Result<Option<String>, String> {
    let ext = Path::new(&default_name)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("json")
        .to_string();
    let picked = app
        .dialog()
        .file()
        .set_file_name(&default_name)
        .add_filter(ext.to_uppercase(), &[ext.as_str()])
        .blocking_save_file();
    let Some(fp) = picked else { return Ok(None) };
    let path = fp.into_path().map_err(err)?;
    fs::write(&path, content).map_err(err)?;
    Ok(Some(path.to_string_lossy().into_owned()))
}

/// Open dialog for a JSON file → its content, or None when cancelled.
#[tauri::command]
async fn open_file_dialog(app: AppHandle) -> Result<Option<String>, String> {
    let picked = app.dialog().file().add_filter("JSON", &["json"]).blocking_pick_file();
    let Some(fp) = picked else { return Ok(None) };
    let path = fp.into_path().map_err(err)?;
    fs::read_to_string(path).map(Some).map_err(err)
}

/// Choose another data folder (e.g. inside OneDrive). If it has no database yet, the current one is
/// copied there; if it already has one, that database is used. Returns the new folder.
#[tauri::command]
async fn pick_data_dir(app: AppHandle) -> Result<Option<String>, String> {
    let picked = app.dialog().file().blocking_pick_folder();
    let Some(fp) = picked else { return Ok(None) };
    let new_dir = fp.into_path().map_err(err)?;
    let old_db = data_dir(&app)?.join(DB_FILE);
    let new_db = new_dir.join(DB_FILE);
    if !new_db.exists() && old_db.exists() {
        fs::copy(&old_db, &new_db).map_err(err)?;
    }
    write_settings(
        &app,
        &Settings {
            data_dir: Some(new_dir.to_string_lossy().into_owned()),
        },
    )?;
    Ok(Some(new_dir.to_string_lossy().into_owned()))
}

#[tauri::command]
fn reset_data_dir(app: AppHandle) -> Result<String, String> {
    write_settings(&app, &Settings::default())?;
    Ok(data_dir(&app)?.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            info,
            load_db,
            save_db,
            fetch_text,
            open_url,
            open_data_dir,
            save_file_dialog,
            open_file_dialog,
            pick_data_dir,
            reset_data_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running CP Tracker");
}
