#!/usr/bin/env node
// UserPromptSubmit: báo lỗi → 5 Whys; phản hồi UX → đưa phương án trước khi sửa; yêu cầu tính năng → làm rõ. Đều qua AskUserQuestion.
import fs from 'node:fs';

let prompt = '';
try { prompt = JSON.parse(fs.readFileSync(0, 'utf8')).prompt || ''; } catch { process.exit(0); }
const text = prompt.normalize('NFC').toLowerCase();

if (/no-?clarify|no-?5whys|bỏ 5 ?whys/u.test(text)) process.exit(0);
// Bật thẳng: `clarify:` → làm rõ yêu cầu, `5whys:` → 5 Whys, `option:` → phương án, bất kể từ khoá.
const force = /(^|\s)clarify:/u.test(text) ? 'feature' : /(^|\s)5 ?whys:/u.test(text) ? 'bug'
  : /(^|\s)options?:/u.test(text) ? 'option' : null;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (words) =>
  new RegExp(`(^|[^\\p{L}])(${words.map(esc).join('|')})(?=$|[^\\p{L}])`, 'u').test(text);

const BUG = [
  'lỗi', 'bug', 'hỏng', 'sai', 'vỡ', 'không chạy', 'không hoạt động', 'không hiện',
  'không đúng', 'bị lệch', 'tại sao', 'vì sao', 'error', 'broken', 'crash', 'fail',
  'root cause', 'root-cause', 'nguyên nhân',
];
const UX = [
  'khó dùng', 'khó hiểu', 'khó nhìn', 'khó đọc', 'khó thấy', 'khó bấm', 'rối', 'chưa ổn', 'không ổn',
  'chưa hợp lý', 'không hợp lý', 'chưa đẹp', 'xấu', 'chưa rõ', 'không rõ',
];
const FEATURE = ['tính năng mới', 'chưa có', 'thiếu', 'màn mới', 'feature', 'ticket', 'yêu cầu mới'];

const BRIEF = 'Prompt là báo cáo subagent → vẫn chạy bước này, nhưng tự điều tra/tự xử lý trước; chỉ hỏi khi cần user quyết. User không đọc báo cáo: tóm tắt ≤ 3 dòng ngay trước câu hỏi.';
const SKIP = 'Bỏ qua nếu prompt không thật sự thuộc loại này (vd. chữ chỉ nằm trong copy UI) hoặc việc hiển nhiên một dòng.';

const BUG_CTX = [
  'Prompt có dấu hiệu báo lỗi/vấn đề. Trước khi sửa, làm rõ root cause theo 5 Whys:',
  '1. Tự điều tra trước (đọc code, chạy build/verify) để có giả thuyết — không hỏi điều tự kiểm được.',
  '2. Mỗi "Why" là MỘT lần gọi AskUserQuestion (1 câu, 2–4 phương án là nguyên nhân khả dĩ từ bằng chứng; phương án khớp bằng chứng nhất đặt đầu, gắn "(Recommended)"). Nhiều nguyên nhân cùng góp → multiSelect, rồi đi tiếp từng nhánh. Why sau dựa trên câu trả lời trước.',
  '3. Dừng ngay khi tới nguyên nhân sửa được và kiểm chứng được — không cố đủ 5 tầng (tối đa 5). User bấm Esc/từ chối thì dừng hẳn, không hỏi lại.',
  '4. Recap chuỗi Why (từng nhánh) → root cause → đề xuất sửa, rồi mới sửa.',
  BRIEF,
  SKIP,
];

const OPTION_CTX = [
  'Prompt là phản hồi UX/giao diện. CHƯA sửa — đưa phương án trước:',
  '1. Tự điều tra hiện trạng (file, hành vi đang có) để hiểu vấn đề người dùng gặp. Không hỏi điều tự kiểm được.',
  '2. Đưa 2–4 phương án khác nhau thật (không phải biến thể vặt), mỗi phương án: hình (ASCII trong `preview` của AskUserQuestion; ≥ 3 hướng bố cục/component → skill ui-moodboard), một dòng đánh đổi. Luôn có phương án tối giản sửa đúng chỗ người dùng chỉ ra.',
  '3. In tóm tắt phương án ngắn trong chat, rồi AskUserQuestion; đề xuất đặt đầu, gắn "(Recommended)". User bấm Esc/từ chối thì dừng hẳn, không hỏi lại.',
  '4. Chỉ sửa theo phương án được chọn.',
  BRIEF,
  SKIP,
];

const FEATURE_CTX = [
  'Prompt có dấu hiệu yêu cầu tính năng mới/còn thiếu. Trước khi làm, làm rõ yêu cầu:',
  '1. Tự điều tra trước: registry/index.md, screens/ và flows/ liên quan — tính năng đã có ở màn khác chưa, component ds/ nào dùng được. Không hỏi điều tự kiểm được.',
  '2. Chỉ hỏi điểm mơ hồ làm đổi pattern, phạm vi (màn/flow nào) hoặc dữ liệu/trạng thái (luật 5 không bịa). Không còn điểm nào → làm luôn, nêu giả định trong recap.',
  '3. Xếp câu theo tác động × độ chưa chắc. Câu độc lập gộp một lần AskUserQuestion (≤ 4); câu phụ thuộc câu trả lời trước để lượt sau. Tối đa 5 câu cả phiên. Phương án đề xuất đặt đầu, gắn "(Recommended)", lý do trong description.',
  '4. Trình bày bằng chứng/đề xuất bằng chữ trước khi hỏi. Câu về hình thức hiển thị (bố cục, component) → skill ui-moodboard trước. User bấm Esc/từ chối thì dừng hẳn, không hỏi lại.',
  '5. Recap yêu cầu đã rõ → gọi component-planner (theo mục Agent trong CLAUDE.md); needs decision của planner là lượt hỏi tiếp, vẫn trong trần 5 câu. Sửa nhỏ thì làm thẳng.',
  BRIEF,
  SKIP,
];

const ctx = force === 'feature' ? FEATURE_CTX : force === 'bug' ? BUG_CTX : force === 'option' ? OPTION_CTX
  : has(BUG) ? BUG_CTX : has(UX) ? OPTION_CTX : has(FEATURE) ? FEATURE_CTX : null;
if (!ctx) process.exit(0);

process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: ctx.join('\n') },
}));
