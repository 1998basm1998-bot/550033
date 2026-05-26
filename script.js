// مخزن الذاكرة المحلي للملفات البرمجية والتهيئة الأساسية
let fileStorage = {
    'user-app': `<!-- كود واجهة تطبيق المستخدم المجلوب (Client) -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { background: #0b1329; color: white; display: flex; justify-content: center; align-items: center; height: 90vh; font-family: sans-serif; margin:0; }
        .product-card { background: rgba(255,255,255,0.04); padding: 25px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px); width: 80%; }
        h2 { color: #10b981; margin-top: 0; }
        button { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="product-card">
        <h2>متجر تفاحة ميسان الرقمي</h2>
        <p>مرحباً بك في واجهة المستخدم المحلية. جرب شراء المنتجات لمشاهدة المزامنة الفورية مع لوحة المسؤولين.</p>
        <div style="border: 1px dashed rgba(255,255,255,0.2); padding: 10px; margin: 10px 0; font-size:13px;" id="local-db-status">
            صندوق المنتجات: تفاح طازج (150 دينار)
        </div>
        <button onclick="simulatePurchase()">شراء المنتج الآن</button>
    </div>

    <script>
        function simulatePurchase() {
            // إرسال البيانات المزامنة للوحة التحكم عبر الـ localStorage المشترك للـ Sandbox
            let currentOrders = JSON.parse(localStorage.getItem('sandbox_orders') || '[]');
            currentOrders.push({ id: Date.now(), item: 'تفاح طازج ميسان', price: '150 د.ع', time: new Date().toLocaleTimeString() });
            localStorage.setItem('sandbox_orders', JSON.stringify(currentOrders));
            alert('تم إرسال طلب الشراء! انظر إلى لوحة الأدمن بجانبك لتشاهد المزامنة الفورية بدون إنترنت.');
        }
    </script>
</body>
</html>`,

    'admin-app': `<!-- كود لوحة تحكم المسؤول (Admin Panel) -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { background: #0f172a; color: #e2e8f0; padding: 25px; font-family: sans-serif; margin: 0; }
        .header { border-bottom: 2px solid #10b981; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
        h2 { margin: 0; color: #10b981; }
        .order-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        .order-table th, .order-table td { padding: 12px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .order-table th { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .empty-tip { text-align: center; color: #64748b; padding: 30px; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h2>لوحة إدارة مبيعات المتجر الإلكتروني</h2>
        <button onclick="clearOrders()" style="background: rgba(255,0,0,0.2); color: #f87171; border: 1px solid rgba(255,0,0,0.4); padding: 4px 10px; border-radius: 4px; cursor:pointer;">تصفير السجل</button>
    </div>

    <table class="order-table">
        <thead>
            <tr>
                <th>معرف الطلب</th>
                <th>المنتج المجلوب</th>
                <th>السعر الفعلي</th>
                <th>توقيت العملية</th>
            </tr>
        </thead>
        <tbody id="orders-tbody">
            <!-- البيانات تحقن حياً ومحلياً هنا -->
        </tbody>
    </table>
    <div id="empty-view" class="empty-tip">في انتظار عمليات شراء من واجهة الكلاينت المجاورة...</div>

    <script>
        function loadOrders() {
            let orders = JSON.parse(localStorage.getItem('sandbox_orders') || '[]');
            let tbody = document.getElementById('orders-tbody');
            let emptyView = document.getElementById('empty-view');
            tbody.innerHTML = '';
            
            if(orders.length === 0) {
                emptyView.style.display = 'block';
                return;
            }
            emptyView.style.display = 'none';
            orders.forEach(ord => {
                let row = `<tr>
                    <td>\${ord.id}</td>
                    <td>\${ord.item}</td>
                    <td>\${ord.price}</td>
                    <td>\${ord.time}</td>
                </tr>`;
                tbody.innerHTML += row;
            });
        }
        
        function clearOrders() {
            localStorage.removeItem('sandbox_orders');
            loadOrders();
        }

        // فحص دوري كل ثانية لمشاهدة المزامنة الحية الحرة دون حجب المتصفح
        setInterval(loadOrders, 1000);
        window.onload = loadOrders;
    </script>
</body>
</html>`
};

let activeCodeFile = 'user-app';
let selectedAIModel = 'flash';
let isDbModeReal = false;

// 1. ميزة التحكم وتحريك العازل / السحب الهيدروليكي (الميزة المطلوبة بشدة)
const dragBar = document.getElementById('drag-resizable-bar');
const leftWorkspace = document.getElementById('left-workspace');
const rightWorkspace = document.getElementById('right-preview-workspace');

dragBar.addEventListener('mousedown', function(e) {
    e.preventDefault();
    document.addEventListener('mousemove', handlePanelResize);
    document.addEventListener('mouseup', stopPanelResize);
    document.body.style.cursor = 'col-resize';
});

function handlePanelResize(e) {
    // حساب النسبة المئوية لعرض الشاشة بناءً على حركة الماوس يميناً ويساراً
    let percentage = (e.clientX / window.innerWidth) * 100;
    
    // وضع حدود أمان لعدم اختفاء أي بانل بالكامل
    if (percentage > 25 && percentage < 78) {
        leftWorkspace.style.width = percentage + '%';
        rightWorkspace.style.width = (100 - percentage) + '%';
    }
}

function stopPanelResize() {
    document.removeEventListener('mousemove', handlePanelResize);
    document.removeEventListener('mouseup', stopPanelResize);
    document.body.style.cursor = 'default';
    // إجبار التحديث بعد التكبير لضمان تجاوب الـ iframes
    forceUpdatePreview();
}

// 2. إدارة التنقل بين التبويبات الرئيسية (التطوير ضد الإعدادات)
function switchMainTab(tab) {
    document.querySelectorAll('.main-tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`btn-tab-${tab}`).classList.add('active');
}

// 3. إدارة تبديل ملفات المحرر الجانبي الديناميكي
function switchCodeFile(fileKey) {
    // حفظ الكود الحالي المكتوب في الشاشة قبل النقل
    fileStorage[activeCodeFile] = document.getElementById('code-editor-textarea').value;
    activeCodeFile = fileKey;
    
    document.getElementById('code-editor-textarea').value = fileStorage[fileKey];
    document.querySelectorAll('.panel-header-tabs .code-tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // تفعيل الوميض البصري للزر النشط
    if(fileKey === 'user-app') {
        document.querySelectorAll('.panel-header-tabs .code-tab-btn')[0].classList.add('active');
    } else if(fileKey === 'admin-app') {
        document.getElementById('tab-btn-admin').classList.add('active');
    } else {
        // للمللفات الديناميكية مثل المانيفست للـ PWA
        document.getElementById(`tab-btn-${fileKey}`).classList.add('active');
    }
}

// 4. تحديث وحقن الأكواد داخل الـ iframes عبر الـ Blob URL لحرية قواعد البيانات ومنع الحجب
function forceUpdatePreview() {
    // حفظ التعديلات اللحظية من المحرر النصي
    fileStorage[activeCodeFile] = document.getElementById('code-editor-textarea').value;
    
    // أ. تحديث تطبيق المستخدم
    const iframeUser = document.getElementById('iframe-user-app');
    const blobUser = new Blob([fileStorage['user-app']], { type: 'text/html' });
    iframeUser.src = URL.createObjectURL(blobUser);
    
    // ب. تحديث لوحة الأدمن إذا كانت مفتوحة وموجودة
    const iframeAdmin = document.getElementById('iframe-admin-app');
    if(fileStorage['admin-app']) {
        const blobAdmin = new Blob([fileStorage['admin-app']], { type: 'text/html' });
        iframeAdmin.src = URL.createObjectURL(blobAdmin);
    }
}

// 5. زر ومستويات تحويل ميزانية الاستهلاك والذكاء الاصطناعي فوق مستطيل الكتابة
function setAIModel(model) {
    selectedAIModel = model;
    document.querySelectorAll('.model-switcher-bar .model-btn').forEach(btn => btn.classList.remove('active'));
    
    if(model === 'flash') document.getElementById('btn-model-flash').classList.add('active');
    if(model === 'pro') document.getElementById('btn-model-pro').classList.add('active');
    if(model === 'deep') document.getElementById('btn-model-deep').classList.add('active');
}

// 6. محاكاة جلب ملفات المشروع من GitHub مع خط الأنميشن المتدرج الجميل والحقيقي
function triggerGitHubImport() {
    const url = document.getElementById('github-url-input').value.trim();
    if(!url) {
        alert('من فضلك أدخل رابط مستودع GitHub أولاً.');
        return;
    }
    
    const wrapper = document.getElementById('github-progress-wrapper');
    const line = document.getElementById('github-progress-line');
    const target = document.getElementById('github-target-select').value;
    
    wrapper.style.display = 'block';
    line.style.width = '0%';
    
    let currentWidth = 0;
    // أنميشن حقيقي يمشي تدريجياً لجلب الأكواد وبث الطمأنينة البصرية
    const interval = setInterval(() => {
        currentWidth += Math.random() * 8;
        if(currentWidth >= 100) {
            currentWidth = 100;
            clearInterval(interval);
            
            // عند اكتمال الجلب
            setTimeout(() => {
                wrapper.style.display = 'none';
                alert(`تم جلب ملفات المشروع من GitHub بنجاح كـ [${target === 'user-app' ? 'تطبيق للمستخدم' : 'لوحة أدمن'}]. تم تحديث بيئة المعاينة الفورية.`);
                forceUpdatePreview();
            }, 400);
        }
        line.style.width = currentWidth + '%';
    }, 100);
}

// 7. زر تفعيل قواعد البيانات ومعالجة الفحص الصامت الآمن لمنع الخراب (Fail-safe)
function toggleDatabaseMode(mode) {
    const btnLocal = document.getElementById('btn-db-local');
    const btnReal = document.getElementById('btn-db-real');
    
    if(mode === 'local') {
        isDbModeReal = false;
        btnLocal.classList.add('active');
        btnReal.classList.remove('active');
        btnReal.classList.remove('failed-safe');
        alert('تم تنشيط قاعدة البيانات المحلية (Sandbox Mode). تعمل النوافذ المزدوجة بمزامنة حية كاملة بدون إنترنت وبأعلى أمان.');
    } else {
        // محاكاة الفحص الآمن قبل التحويل لقاعدة حقيقية
        btnReal.innerText = 'جاري فحص الاتصال الصامت...';
        
        setTimeout(() => {
            // سيناريو المحاكاة: نفترض فشل الاتصال لعدم وجود إعدادات حقيقية مدخلة للـ Firebase لحماية المطور
            btnReal.innerText = 'قاعدة بيانات حقيقية';
            btnReal.classList.add('failed-safe');
            btnLocal.classList.add('active'); // الاحتفاظ بالمحلي شغالاً لحمايته من الخراب
            
            alert('تنبيه فحص الأمان (Fail-safe): تعذر بناء اتصال حقيقي مستقر بقاعدة البيانات الخارجية (بسبب نقص أسطر الـ Config). قام النظام بتحويل المجرى تلقائياً إلى الذاكرة المحلية (Sandbox) لضمان عدم توقف واجهات متجرك.');
        }, 1200);
    }
}

// 8. زر توليد المعاينة الخارجية المستقلة تماماً في تبويب جديد
function generateExternalPreviewLink() {
    let currentCode = document.getElementById('code-editor-textarea').value;
    const blob = new Blob([currentCode], { type: 'text/html' });
    const externalUrl = URL.createObjectURL(blob);
    
    // فتح الكود حياً ومستقلاً لتجربته على الجوال الحقيقي أو تبويب مجاور
    window.open(externalUrl, '_blank');
}

// 9. معالجة إرسال الأوامر وبناء مراحل التفكير الحية الحقيقية وحساب الفاتورة
async function processChatMessage() {
    const inputEl = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-messages');
    const queryText = inputEl.value.trim();
    
    if(!queryText) return;
    
    // عرض رسالة باسم المستخدم
    chatContainer.innerHTML += `<div class="message user">${queryText}</div>`;
    inputEl.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // إعداد معرف عشوائي لرسالة الذكاء الاصطناعي القادمة ومراحل تفكيرها
    const aiMessageId = 'ai-node-' + Date.now();
    
    let thinkingHtml = '';
    // حقن مراحل التفكير الحية للبرو والعميق لإيضاح مراحل العمل
    if(selectedAIModel === 'pro' || selectedAIModel === 'deep') {
        thinkingHtml = `
            <div class="thinking-box-realtime" id="think-box-${aiMessageId}">
                <div class="thinking-node" id="step1-${aiMessageId}"><i class="fa-solid fa-spinner"></i> <span>جاري فحص بنية الأكواد الحالية للمتجر والأدمن...</span></div>
                <div class="thinking-node hidden" id="step2-${aiMessageId}"><i class="fa-solid fa-spinner"></i> <span>بدء التعديل الجراحي الموضعي لحماية ملفاتك السابقة من التخريب...</span></div>
                <div class="thinking-node hidden" id="step3-${aiMessageId}"><i class="fa-solid fa-spinner"></i> <span>محاكاة جودة الاتصال وتحديث الـ Previews الحية...</span></div>
            </div>
        `;
    }
    
    chatContainer.innerHTML += `
        <div class="message ai" id="${aiMessageId}">
            <div class="ai-text-content"><i class="fa-solid fa-gear-spin fa-spin"></i> يفكر المساعد المطور الآن...</div>
            ${thinkingHtml}
        </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // محاكاة التنقل المنطقي بين الجمل لتظهر حقيقية وبث التأني للمطور
    if(selectedAIModel === 'pro' || selectedAIModel === 'deep') {
        setTimeout(() => {
            let s1 = document.getElementById(`step1-${aiMessageId}`);
            if(s1) s1.innerHTML = `<i class="fa-solid fa-circle-check"></i> <del>تم فحص بنية الملفات المصدرية المجلوبة بنجاح.</del>`;
            let s2 = document.getElementById(`step2-${aiMessageId}`);
            if(s2) s2.classList.remove('hidden');
        }, 1500);

        setTimeout(() => {
            let s2 = document.getElementById(`step2-${aiMessageId}`);
            if(s2) s2.innerHTML = `<i class="fa-solid fa-circle-check"></i> <del>اكتملت هندسة التعديل الموضعي واستبدال الأسطر القديمة بجراحية.</del>`;
            let s3 = document.getElementById(`step3-${aiMessageId}`);
            if(s3) s3.classList.remove('hidden');
        }, 3200);
    }

    // محاكاة استجابة الـ API الفعلي وحساب التكلفة المالية الدقيقة للتوكنات في نهاية الرد
    setTimeout(() => {
        let aiBox = document.getElementById(aiMessageId);
        let textContainer = aiBox.querySelector('.ai-text-content');
        
        let responseMessage = '';
        
        // إذا طلب بناء الأدمن، يفتح ديناميكياً المعاينة المزدوجة المشتركة
        if(queryText.includes('الأدمن') || queryText.includes('الادمن') || queryText.includes('ابني')) {
            document.getElementById('preview-admin-wrapper').classList.remove('hidden');
            responseMessage = `لقد استجبت لأمرك الاستراتيجي! قمت بـ **بناء نظام الأدمن الإداري**، وفتحت لك **نافذة معاينة ثانية موازية** على اليسار لترى التحكم الكامل حياً ومباشراً. <br><br>تم تفعيل التعديل الجزئي الذكي، وأكواد ` + "`admin.js`" + ` جاهزة للنسخ والمطابقة الفورية مع ملفات GitHub الخاصة بك.`;
        } else {
            responseMessage = `تمت معالجة أمرك البرمجي بنجاح وبدقة جراحية تامة. قمت بالبحث عن الأسطر المخصصة وحدثت الأكواد الجانبية المطلوبة دون إعادة كتابة الملف كاملاً لحماية رصيدك المالي ومنع الهلوسة البرمجية. التغيير يظهر الآن حياً في شاشة المعاينة التفاعلية المدمجة.`;
        }
        
        textContainer.innerHTML = responseMessage;
        
        // حساب التكلفة الافتراضية الدقيقة وحقنها للشفافية المالية
        if(selectedAIModel === 'pro' || selectedAIModel === 'deep') {
            let tBox = document.getElementById(`think-box-${aiMessageId}`);
            let inputTokens = Math.floor(Math.random() * 1200) + 400;
            let outputTokens = Math.floor(Math.random() * 600) + 200;
            let costRate = selectedAIModel === 'deep' ? 0.0055 : 0.0021;
            
            tBox.innerHTML += `
                <div class="tokens-cost-summary">
                    <span><i class="fa-solid fa-microchip"></i> الرموز: مدخلة ${inputTokens} | مخرجة ${outputTokens}</span>
                    <span>تكلفة هذه الرسالة المالية: $${costRate.toFixed(4)}</span>
                </div>
            `;
            
            // تحديث محفظة العرض الكلية في الشريط الجانبي للمطور
            document.getElementById('global-cost-display').innerHTML = `<i class="fa-solid fa-wallet"></i> $${costRate.toFixed(4)}`;
        }
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        forceUpdatePreview();
        
    }, 4800);
}

// 10. تبديل الثيم البصري والـ Glassmorphism للأمان العيني للمطور
function toggleInterfaceTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('devstudio_theme', newTheme);
}

// أداة مساعدة لإظهار وإخفاء كلمات المرور للـ API Keys
function toggleInputVisibility(id) {
    const el = document.getElementById(id);
    el.type = el.type === 'password' ? 'text' : 'password';
}

function commitGlobalSettings() {
    localStorage.setItem('gemini_key', document.getElementById('input-gemini-key').value);
    localStorage.setItem('github_token', document.getElementById('input-github-token').value);
    alert('تم حفظ رموز الأمان وتحديث إعدادات النظام المحلي بنجاح!');
    switchMainTab('dev');
}

// النسخ الفوري للكود المكتوب حالياً في المحرر
function copyCurrentCode() {
    const textarea = document.getElementById('code-editor-textarea');
    textarea.select();
    document.execCommand('copy');
    alert('تم نسخ الشفرة المصدرية الحالية بنجاح لمجلد مشروعك الحقيقي!');
}

// التشغيل الأولي وتغذية الأكواد عند فتح النظام لأول مرة
window.onload = function() {
    document.getElementById('code-editor-textarea').value = fileStorage[activeCodeFile];
    
    // استعادة الثيم المفضل
    const savedTheme = localStorage.getItem('devstudio_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    if(localStorage.getItem('gemini_key')) document.getElementById('input-gemini-key').value = localStorage.getItem('gemini_key');
    if(localStorage.getItem('github_token')) document.getElementById('input-github-token').value = localStorage.getItem('github_token');
    
    forceUpdatePreview();
};
