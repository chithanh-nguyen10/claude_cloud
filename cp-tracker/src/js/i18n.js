/* CP Tracker — song ngữ VI / EN */
(function (global) {
'use strict';
const D = {
  vi: {
    'nav.queue': 'Queue', 'nav.fav': 'Kho bài thú vị', 'nav.all': 'Tất cả bài', 'nav.done': 'Đã AC', 'nav.collections': 'Bộ sưu tập', 'nav.settings': 'Cài đặt',
    'col.add': 'Thêm bộ sưu tập', 'col.ph': 'Tên bộ sưu tập', 'col.rename': 'Đổi tên', 'col.delete': 'Xoá bộ sưu tập', 'col.deleteAsk': 'Xoá bộ sưu tập "{n}"? Các bài vẫn còn trong danh sách.',
    'add.ph': 'Dán link bài rồi Enter (Codeforces, AtCoder, oj.uz, CS Academy, CodeChef, DMOJ, VNOJ)…', 'add.btn': 'Thêm', 'add.many': 'Thêm nhiều',
    'many.title': 'Thêm nhiều bài', 'many.hint': 'Dán nhiều link, mỗi dòng một link (hoặc cách nhau bởi dấu cách).', 'many.toQueue': 'Đưa vào Queue', 'many.ok': 'Thêm',
    'common.cancel': 'Huỷ', 'common.delete': 'Xoá', 'common.open': 'Mở', 'common.yes': 'Đồng ý',
    'v.queue.t': 'Queue', 'v.queue.d': 'Bài đang chờ làm. Kéo ⋮⋮ để xếp thứ tự ưu tiên.',
    'v.fav.t': 'Kho bài thú vị', 'v.fav.d': 'Bài hay để xem lại, kèm ghi chú và lời giải.',
    'v.all.t': 'Tất cả bài', 'v.all.d': 'Mọi bài bạn đã thêm.', 'v.done.t': 'Đã AC', 'v.done.d': 'Bài đã làm được, mới nhất trước.',
    'v.col.d': 'Bộ sưu tập', 'v.settings.t': 'Cài đặt',
    'act.next': '▶ Làm bài tiếp theo', 'act.clean': 'Dọn bài đã xong khỏi Queue', 'act.cleaned': 'Đã bỏ {n} bài xong khỏi Queue', 'act.noNext': 'Queue không còn bài chưa làm',
    'f.search': 'Tìm tên, mã bài, tag, ghi chú…', 'f.allPlat': 'Mọi nền tảng', 'f.allStatus': 'Mọi trạng thái', 'f.allTags': 'Mọi tag', 'f.count': '{n} bài',
    'sort.queue': 'Thứ tự Queue', 'sort.added': 'Mới thêm trước', 'sort.diffAsc': 'Độ khó tăng', 'sort.diffDesc': 'Độ khó giảm', 'sort.title': 'Tên A→Z', 'sort.ac': 'Mới AC trước', 'sort.stars': 'Nhiều sao trước',
    'st.todo': 'Chưa làm', 'st.doing': 'Đang làm', 'st.stuck': 'Bí', 'st.ac': 'Đã AC', 'st.skip': 'Bỏ qua',
    'g.done': 'Đã xong ({n})',
    'e.queue.t': 'Queue đang trống', 'e.queue.d': 'Dán link bài vào ô phía trên rồi Enter. Ví dụ:', 'e.fav.t': 'Chưa có bài nào trong kho', 'e.fav.d': 'Bấm ☆ ở một bài để đưa vào Kho bài thú vị.',
    'e.all.t': 'Chưa có bài nào', 'e.done.t': 'Chưa có bài nào đã AC', 'e.done.d': 'Đổi trạng thái một bài thành "Đã AC" để thấy ở đây.', 'e.col.t': 'Bộ sưu tập trống', 'e.col.d': 'Mở một bài, ở mục "Bộ sưu tập" bấm tên bộ này để thêm vào.',
    'e.filter': 'Không có bài nào khớp bộ lọc.', 'e.tip': 'Mẹo: đang ở trang nào thì bài dán vào được thêm vào đó (Queue, Kho, Bộ sưu tập). Ctrl+V ở bất kỳ đâu ngoài ô nhập cũng được.',
    'd.empty': 'Chọn một bài để xem và ghi chú.', 'd.open': 'Mở đề ↗', 'd.refetch': 'Lấy lại thông tin', 'd.status': 'Trạng thái', 'd.queue': 'Trong Queue', 'd.fav': 'Kho bài thú vị',
    'd.stars': 'Độ hay', 'd.myTags': 'Tag của tôi', 'd.myTagsPh': 'vd: dp, trick hay, cần ôn (cách nhau bởi dấu phẩy)', 'd.tags': 'Tag của đề', 'd.diff': 'Độ khó',
    'd.collections': 'Bộ sưu tập', 'd.noCol': 'Chưa có bộ sưu tập nào. Tạo ở thanh bên trái (+).', 'd.editorial': 'Link editorial', 'd.notes': 'Ghi chú (Markdown)', 'd.notesPh': 'Ý tưởng chính, nhận xét, chỗ dễ sai…',
    'd.write': 'Viết', 'd.view': 'Xem', 'd.code': 'Code lời giải', 'd.codePh': 'Dán code AC vào đây', 'd.added': 'Thêm lúc', 'd.acAt': 'AC lúc', 'd.delete': 'Xoá bài này', 'd.deleteAsk': 'Xoá hẳn bài này và ghi chú của nó?',
    'd.manualTitle': 'Trang này không cho lấy tên bài tự động. Bấm vào tên ở trên để sửa.', 'd.metaErr': 'Không lấy được thông tin bài: {e}', 'd.titlePh': 'Tên bài',
    't.added': 'Đã thêm {n} bài', 't.exists': 'Bài đã có: {t}', 't.bad': 'Không nhận ra link: {s}', 't.other': 'Link không thuộc nền tảng hỗ trợ, đã thêm dạng "Khác". Sửa tên ở bảng bên phải.',
    't.saveErr': 'Không lưu được dữ liệu: {e}', 't.exported': 'Đã lưu {f}', 't.imported': 'Đã nhập {a} bài, bỏ qua {s} bài trùng', 't.importErr': 'File không đúng định dạng CP Tracker', 't.dirChanged': 'Đã đổi thư mục dữ liệu',
    's.lang': 'Ngôn ngữ', 's.theme': 'Giao diện', 's.theme.system': 'Theo Windows', 's.theme.light': 'Sáng', 's.theme.dark': 'Tối',
    's.data': 'Dữ liệu', 's.dataDesc': 'Mọi thứ nằm trong một file JSON trên máy bạn. Đặt thư mục dữ liệu trong OneDrive / Google Drive để dùng chung giữa nhiều máy.',
    's.dataDir': 'Thư mục dữ liệu', 's.change': 'Đổi thư mục…', 's.default': 'Về mặc định', 's.openDir': 'Mở thư mục', 's.backup': 'Mỗi ngày tự sao lưu một bản vào thư mục backups (giữ 14 ngày gần nhất).',
    's.export': 'Xuất / nhập', 's.exportJson': 'Xuất JSON (đầy đủ)', 's.exportCsv': 'Xuất CSV (mở bằng Excel)', 's.import': 'Nhập từ file JSON…', 's.importMode': 'Khi nhập', 's.merge': 'Gộp (bỏ qua bài đã có)', 's.replace': 'Thay thế toàn bộ',
    's.replaceAsk': 'Thay toàn bộ dữ liệu hiện tại bằng file này? Bản hiện tại vẫn còn trong thư mục backups.',
    's.about': 'Thông tin', 's.version': 'Phiên bản {v}', 's.web': 'Đang chạy trên trình duyệt (bản thử): dữ liệu lưu trong trình duyệt và không lấy được tên bài tự động.',
    's.platforms': 'Nền tảng hỗ trợ', 's.platDesc': 'Codeforces, AtCoder: tên, độ khó, tag · DMOJ: tên, điểm, tag · CodeChef: tên, độ khó, tag · oj.uz: tên · VNOJ, CS Academy, Codeforces Gym: lấy mã bài từ link, tên sửa tay.',
    'stat.total': '{n} bài · {ac} đã AC',
  },
  en: {
    'nav.queue': 'Queue', 'nav.fav': 'Favorites', 'nav.all': 'All problems', 'nav.done': 'Solved', 'nav.collections': 'Collections', 'nav.settings': 'Settings',
    'col.add': 'Add collection', 'col.ph': 'Collection name', 'col.rename': 'Rename', 'col.delete': 'Delete collection', 'col.deleteAsk': 'Delete collection "{n}"? The problems stay in your list.',
    'add.ph': 'Paste a problem link and press Enter (Codeforces, AtCoder, oj.uz, CS Academy, CodeChef, DMOJ, VNOJ)…', 'add.btn': 'Add', 'add.many': 'Add many',
    'many.title': 'Add many problems', 'many.hint': 'Paste several links, one per line (or separated by spaces).', 'many.toQueue': 'Put them in the Queue', 'many.ok': 'Add',
    'common.cancel': 'Cancel', 'common.delete': 'Delete', 'common.open': 'Open', 'common.yes': 'Yes',
    'v.queue.t': 'Queue', 'v.queue.d': 'Problems waiting to be solved. Drag ⋮⋮ to set the order.',
    'v.fav.t': 'Favorites', 'v.fav.d': 'Problems worth revisiting, with notes and solutions.',
    'v.all.t': 'All problems', 'v.all.d': 'Every problem you added.', 'v.done.t': 'Solved', 'v.done.d': 'Problems you solved, newest first.',
    'v.col.d': 'Collection', 'v.settings.t': 'Settings',
    'act.next': '▶ Next problem', 'act.clean': 'Remove finished problems from the Queue', 'act.cleaned': 'Removed {n} finished problems from the Queue', 'act.noNext': 'No unsolved problem left in the Queue',
    'f.search': 'Search title, code, tag, notes…', 'f.allPlat': 'All platforms', 'f.allStatus': 'Any status', 'f.allTags': 'Any tag', 'f.count': '{n} problems',
    'sort.queue': 'Queue order', 'sort.added': 'Newest first', 'sort.diffAsc': 'Easiest first', 'sort.diffDesc': 'Hardest first', 'sort.title': 'Title A→Z', 'sort.ac': 'Recently solved', 'sort.stars': 'Most stars',
    'st.todo': 'To do', 'st.doing': 'In progress', 'st.stuck': 'Stuck', 'st.ac': 'Solved', 'st.skip': 'Skipped',
    'g.done': 'Finished ({n})',
    'e.queue.t': 'The Queue is empty', 'e.queue.d': 'Paste a problem link in the box above and press Enter. For example:', 'e.fav.t': 'No favorites yet', 'e.fav.d': 'Click ☆ on a problem to add it here.',
    'e.all.t': 'No problems yet', 'e.done.t': 'Nothing solved yet', 'e.done.d': 'Set a problem to "Solved" to see it here.', 'e.col.t': 'This collection is empty', 'e.col.d': 'Open a problem and click this collection under "Collections".',
    'e.filter': 'No problem matches the filters.', 'e.tip': 'Tip: links are added to the page you are on (Queue, Favorites, a collection). Ctrl+V anywhere outside a text box works too.',
    'd.empty': 'Select a problem to see it and take notes.', 'd.open': 'Open ↗', 'd.refetch': 'Refresh info', 'd.status': 'Status', 'd.queue': 'In Queue', 'd.fav': 'Favorite',
    'd.stars': 'Rating', 'd.myTags': 'My tags', 'd.myTagsPh': 'e.g. dp, nice trick, review (comma separated)', 'd.tags': 'Problem tags', 'd.diff': 'Difficulty',
    'd.collections': 'Collections', 'd.noCol': 'No collections yet. Create one in the sidebar (+).', 'd.editorial': 'Editorial link', 'd.notes': 'Notes (Markdown)', 'd.notesPh': 'Key idea, observations, pitfalls…',
    'd.write': 'Write', 'd.view': 'Preview', 'd.code': 'Solution code', 'd.codePh': 'Paste your accepted code here', 'd.added': 'Added', 'd.acAt': 'Solved', 'd.delete': 'Delete this problem', 'd.deleteAsk': 'Delete this problem and its notes for good?',
    'd.manualTitle': 'This site does not allow reading the title automatically. Click the title above to edit it.', 'd.metaErr': 'Could not fetch problem info: {e}', 'd.titlePh': 'Problem title',
    't.added': 'Added {n} problem(s)', 't.exists': 'Already added: {t}', 't.bad': 'Not a problem link: {s}', 't.other': 'Unsupported site, added as "Other". Edit the title on the right.',
    't.saveErr': 'Could not save your data: {e}', 't.exported': 'Saved {f}', 't.imported': 'Imported {a} problems, skipped {s} duplicates', 't.importErr': 'This is not a CP Tracker file', 't.dirChanged': 'Data folder changed',
    's.lang': 'Language', 's.theme': 'Theme', 's.theme.system': 'Follow Windows', 's.theme.light': 'Light', 's.theme.dark': 'Dark',
    's.data': 'Data', 's.dataDesc': 'Everything lives in one JSON file on your computer. Put the data folder in OneDrive / Google Drive to share it between computers.',
    's.dataDir': 'Data folder', 's.change': 'Change folder…', 's.default': 'Use default', 's.openDir': 'Open folder', 's.backup': 'A backup is saved to the backups folder every day (the last 14 days are kept).',
    's.export': 'Export / import', 's.exportJson': 'Export JSON (complete)', 's.exportCsv': 'Export CSV (for Excel)', 's.import': 'Import a JSON file…', 's.importMode': 'When importing', 's.merge': 'Merge (skip problems you already have)', 's.replace': 'Replace everything',
    's.replaceAsk': 'Replace all current data with this file? The current data stays in the backups folder.',
    's.about': 'About', 's.version': 'Version {v}', 's.web': 'Running in a browser (preview): data is stored in the browser and titles cannot be fetched.',
    's.platforms': 'Supported platforms', 's.platDesc': 'Codeforces, AtCoder: title, difficulty, tags · DMOJ: title, points, tags · CodeChef: title, difficulty, tags · oj.uz: title · VNOJ, CS Academy, Codeforces Gym: code from the link, edit the title yourself.',
    'stat.total': '{n} problems · {ac} solved',
  },
};
let lang = 'vi';
function t(k, p) {
  let s = (D[lang] && D[lang][k]) || D.vi[k] || k;
  if (p) s = s.replace(/\{(\w+)\}/g, (m, x) => (p[x] !== undefined ? p[x] : m));
  return s;
}
function apply(root) {
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.documentElement.lang = lang;
}
global.I18N = { t, apply, set lang(l) { lang = l === 'en' ? 'en' : 'vi'; }, get lang() { return lang; } };
global.t = t;
})(window);
