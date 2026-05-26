// ذاكرة النظام الحية لتخزين وإدارة الملفات مقسمة لـ HTML/CSS/JS كما طُلب
let fileStorage = {
    'user-html': '<div class="product-card">\n    <h2>متجر تفاحة ميسان الرقمي</h2>\n    <p>مرحباً بك في واجهة المستخدم المحلية. جرب شراء المنتجات لمشاهدة المزامنة الفورية مع لوحة المسؤولين.</p>\n    <div style="border: 1px dashed rgba(255,255,255,0.2); padding: 10px; margin: 10px 0; font-size:13px;" id="local-db-status">\n        صندوق المنتجات: تفاح طازج (150 دينار)\n    </div>\n    <button onclick="simulatePurchase()">شراء المنتج الآن</button>\n</div>',
    'user-css': 'body { background: #0b1329; color: white; display: flex; justify-content: center; align-items: center; height: 90vh; font-family: sans-serif; margin:0; }\n.product-card { background: rgba(255,255,255,0.04); padding: 25px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px); width: 80%; }\nh2 { color: #10b981; margin-top: 0; }\nbutton { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 15px; }',
    'user-js': 'function simulatePurchase() {\n    let currentOrders = JSON.parse(localStorage.getItem("sandbox_orders") || "[]");\n    currentOrders.push({ id: Date.now(), item: "تفاح طازج ميسان", price: "150 د.ع", time: new Date().toLocaleTimeString() });\n    localStorage.setItem("sandbox_orders", JSON.stringify(currentOrders));\n    alert("تم إرسال طلب الشراء! انظر إلى لوحة الأدمن بجانبك لتشاهد المزامنة الفورية بدون إنترنت.");\n}',
    'admin-html': '<div class="header">\n    <h2>لوحة إدارة مبيعات المتجر الإلكتروني</h2>\n    <button onclick="clearOrders()" style="background: rgba(255,0,0,0.2); color: #f87171; border: 1px solid rgba(255,0,0,0.4); padding: 4px 10px; border-radius: 4px; cursor:pointer;">تصفير السجل</button>\n</div>\n<table class="order-table">\n    <thead>\n        <tr>\n            <th>معرف الطلب</th>\n            <th>المنتج المجلوب</th>\n            <th>السعر الفعلي</th>\n            <th>توقيت العملية</th>\n        </tr>\n    </thead>\n    <tbody id="orders-tbody">\n    </tbody>\n</table>\n<div id="empty-view" class="empty-tip">في انتظار عمليات شراء من واجهة الكلاينت المجاورة...</div>',
    'admin-css': 'body { background: #0f172a; color: #e2e8f0; padding: 25px; font-family: sans-serif; margin: 0; }\n.header { border-bottom: 2px solid #10b981; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }\nh2 { margin: 0; color: #10b981; }\n.order-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }\n.order-table th, .order-table td { padding: 12px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1); }\n.order-table th { background: rgba(16, 185, 129, 0.1); color: #10b981; }\n.empty-tip { text-align: center; color: #64748b; padding: 30px; font-style: italic; }',
    'admin-js': 'function loadOrders() {\n    let orders = JSON.parse(localStorage.getItem("sandbox_orders") || "[]");\n    let tbody = document.getElementById("orders-tbody");\n    let emptyView = document.getElementById("empty-view");\n    tbody.innerHTML = "";\n    if(orders.length === 0) {\n        emptyView.style.display = "block";\n        return;\n    }\n    emptyView.style.display = "none";\n    orders.forEach(function(ord) {\n        let row = "<tr><td>" + ord.id + "</td><td>" + ord.item + "</td><td>" + ord.price + "</td><td>" + ord.time + "</td></tr>";\n        tbody.innerHTML += row;\n    });\n}\nfunction clearOrders() {\n    localStorage.removeItem("sandbox_orders");\n    loadOrders();\n}\nsetInterval(loadOrders, 1000);\nwindow.onload = loadOrders;'
};

let activeApp = 'user';
let activeCodeFile = 'html';
let selectedAIModel = 'flash';
let isDbModeReal = false;

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
    let percentage = (e.clientX / window.innerWidth) * 100;
    if (percentage > 20 && percentage < 80) {
        rightWorkspace.style.width = percentage + '%';
        leftWorkspace.style.width = (100 - percentage) + '%';
    }
}

function stopPanelResize() {
    document.removeEventListener('mousemove', handlePanelResize);
    document.removeEventListener('mouseup', stopPanelResize);
    document.body.style.cursor = 'default';
}

function switchMainTab(tab) {
    document.querySelectorAll('.main-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.sidebar-btn').forEach(function(el) { el.classList.remove('active'); });
    
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('btn-tab-' + tab).classList.add('active');
}

function switchAppFile(app) {
    fileStorage[`${activeApp}-${activeCodeFile}`] = document.getElementById('code-editor-textarea').value;
    activeApp = app;
    document.getElementById('code-editor-textarea').value = fileStorage[`${activeApp}-${activeCodeFile}`] || '';
}

function switchCodeFile(fileKey) {
    fileStorage[`${activeApp}-${activeCodeFile}`] = document.getElementById('code-editor-textarea').value;
    activeCodeFile = fileKey;
    
    document.getElementById('code-editor-textarea').value = fileStorage[`${activeApp}-${activeCodeFile}`] || '';
    
    document.querySelectorAll('#code-tabs-container .code-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${fileKey}`).classList.add('active');
}

function forceUpdatePreview() {
    fileStorage[`${activeApp}-${activeCodeFile}`] = document.getElementById('code-editor-textarea').value;
    
    let userHtml = fileStorage['user-html'] || '';
    let userCss = fileStorage['user-css'] || '';
    let userJs = fileStorage['user-js'] || '';
    let userContent = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>${userCss}</style></head><body>${userHtml}<script>${userJs}<\/script></body></html>`;
    const iframeUser = document.getElementById('iframe-user-app');
    const blobUser = new Blob([userContent], { type: 'text/html' });
    iframeUser.src = URL.createObjectURL(blobUser);
    
    let adminHtml = fileStorage['admin-html'] || '';
    let adminCss = fileStorage['admin-css'] || '';
    let adminJs = fileStorage['admin-js'] || '';
    let adminContent = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>${adminCss}</style></head><body>${adminHtml}<script>${adminJs}<\/script></body></html>`;
    const iframeAdmin = document.getElementById('iframe-admin-app');
    const blobAdmin = new Blob([adminContent], { type: 'text/html' });
    iframeAdmin.src = URL.createObjectURL(blobAdmin);
}

function setPreviewMode(mode) {
    document.getElementById('view-user-btn').classList.remove('active');
    document.getElementById('view-admin-btn').classList.remove('active');
    document.getElementById('view-both-btn').classList.remove('active');
    document.getElementById('view-' + mode + '-btn').classList.add('active');
    
    const userWrp = document.getElementById('preview-user-wrapper');
    const adminWrp = document.getElementById('preview-admin-wrapper');
    const adminInner = document.querySelector('#preview-admin-wrapper .iframe-inner-holder');
    
    if(mode === 'user') {
        userWrp.classList.remove('hidden');
        adminWrp.classList.add('hidden');
        if (adminInner) adminInner.classList.remove('user-phone-mode');
    } else if(mode === 'admin') {
        userWrp.classList.add('hidden');
        adminWrp.classList.remove('hidden');
        if (adminInner) adminInner.classList.remove('user-phone-mode');
    } else if(mode === 'both') {
        userWrp.classList.remove('hidden');
        adminWrp.classList.remove('hidden');
        if (adminInner) adminInner.classList.add('user-phone-mode');
        rightWorkspace.style.width = '70%';
        leftWorkspace.style.width = '30%';
    }
}

function setAIModel(model) {
    selectedAIModel = model;
    document.querySelectorAll('.model-switcher-bar .model-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    if(model === 'flash') document.getElementById('btn-model-flash').classList.add('active');
    if(model === 'pro') document.getElementById('btn-model-pro').classList.add('active');
    if(model === 'deep') document.getElementById('btn-model-deep').classList.add('active');
}

function triggerGitHubImport() {
    const url = document.getElementById('github-url-input').value.trim();
    if(!url) {
        alert('من فضلك أدخل رابط مستودع GitHub أولاً.');
        return;
    }
    const wrapper = document.getElementById('github-progress-wrapper');
    const line = document.getElementById('github-progress-line');
    wrapper.style.display = 'block';
    line.style.width = '0%';
    
    let currentWidth = 0;
    const interval = setInterval(function() {
        currentWidth += Math.random() * 9;
        if(currentWidth >= 100) {
            currentWidth = 100;
            clearInterval(interval);
            setTimeout(function() {
                wrapper.style.display = 'none';
                alert('تمت عملية جلب الملفات بنجاح!');
                forceUpdatePreview();
            }, 400);
        }
        line.style.width = currentWidth + '%';
    }, 110);
}

function toggleDatabaseMode(mode) {
    const btnLocal = document.getElementById('btn-db-local');
    const btnReal = document.getElementById('btn-db-real');
    
    if(mode === 'local') {
        isDbModeReal = false;
        btnLocal.classList.add('active');
        btnReal.classList.remove('active');
        btnReal.classList.remove('failed-safe');
        alert('تم تنشيط قاعدة البيانات المحلية.');
    } else {
        btnReal.innerText = 'جاري فحص الاتصال...';
        setTimeout(function() {
            btnReal.innerHTML = '<i class="fa-solid fa-cloud-bolt"></i> حقيقي';
            btnReal.classList.add('failed-safe');
            btnLocal.classList.add('active');
            alert('تعذر بناء اتصال حقيقي (نقص الإعدادات). تم التحويل تلقائياً للذاكرة المحلية.');
        }, 1200);
    }
}

function generateExternalPreviewLink() {
    let userHtml = fileStorage['user-html'] || '';
    let userCss = fileStorage['user-css'] || '';
    let userJs = fileStorage['user-js'] || '';
    let userContent = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>${userCss}</style></head><body>${userHtml}<script>${userJs}<\/script></body></html>`;
    const blob = new Blob([userContent], { type: 'text/html' });
    const externalUrl = URL.createObjectURL(blob);
    window.open(externalUrl, '_blank');
}

// التعديل الجوهري: ربط حقيقي مباشر بـ OpenRouter متوافق مع شحن حسابك ومفتاحك البرمجي الجديد
async function processChatMessage() {
    const inputEl = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-messages');
    const queryText = inputEl.value.trim();
    
    if(!queryText) return;
    
    chatContainer.innerHTML += '<div class="message user">' + queryText + '</div>';
    inputEl.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    const aiMessageId = 'ai-node-' + Date.now();
    
    let thinkingHtml = '<div class="thinking-box-realtime" id="think-box-' + aiMessageId + '">' +
        '<div class="thinking-node" id="step1-' + aiMessageId + '"><i class="fa-solid fa-spinner fa-spin"></i> <span>جاري الاتصال بـ OpenRouter وتوليد الكود...</span></div>' +
    '</div>';
    
    chatContainer.innerHTML += '<div class="message ai" id="' + aiMessageId + '">' +
        '<div class="ai-text-content"><i class="fa-solid fa-arrows-spin fa-spin"></i> جاري معالجة الطلب برمجياً...</div>' +
        thinkingHtml +
    '</div>';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const apiKey = localStorage.getItem('gemini_key');
    let responseMessage = '';
    let inTokens = queryText.length;
    let outTokens = 150; 

    // تحديد الموديل بناءً على خيار المستخدم من الواجهة
    let openrouterModel = "google/gemini-2.5-flash"; 
    if(selectedAIModel === 'pro') openrouterModel = "google/gemini-2.5-pro";
    if(selectedAIModel === 'deep') openrouterModel = "google/gemini-2.5-flash"; // أو يمكنك التبديل لأي موديل تفكير مدعوم في حسابك

    if(apiKey && apiKey.trim().length > 10) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "DevStudio Live"
                },
                body: JSON.stringify({
                    "model": openrouterModel,
                    "messages": [
                        { "role": "user", "content": queryText + " (رد باللغة العربية وركز على تقديم الأكواد البرمجية المطلوبة بوضوح وبطريقة مباشرة)" }
                    ]
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                responseMessage = data.choices[0].message.content.replace(/\n/g, '<br>');
                
                // جلب التوكنات الفعلية من استجابة OpenRouter لفوترتها بالواجهة
                if(data.usage) {
                    inTokens = data.usage.prompt_tokens || inTokens;
                    outTokens = data.usage.completion_tokens || outTokens;
                }
            } else {
                responseMessage = "تنبيه: فشل استلام رد صحيح من السيرفر. تأكد من شحن حسابك في OpenRouter (Credits) وتفعيل الفواتير.";
                if(data.error) {
                    responseMessage += "<br><span style='color:#ff6b6b;'>السبب: " + data.error.message + "</span>";
                }
            }
        } catch(e) {
            responseMessage = "حدث خطأ غير متوقع أثناء معالجة الاتصال: " + e.message;
        }
    } else {
        responseMessage = "تنبيه: أنت تستخدم وضع المحاكاة الافتراضي. لربط الذكاء الاصطناعي الحقيقي، اذهب لتبويبة الإعدادات وأدخل مفتاح API الذي يبدأ بـ (sk-or-...) ثم اضغط حفظ.";
        if(queryText.includes('الأدمن') || queryText.includes('ابني')) {
            setPreviewMode('both');
        }
    }

    let aiBox = document.getElementById(aiMessageId);
    let textContainer = aiBox.querySelector('.ai-text-content');
    textContainer.innerHTML = responseMessage;
    
    // حساب أسعار الاستهلاك التقريبية للمقاييس
    let costRate = selectedAIModel === 'pro' ? 0.0000025 : 0.000000075; 
    let costOutRate = selectedAIModel === 'pro' ? 0.0000100 : 0.0000003;
    let totalCostDollars = (inTokens * costRate) + (outTokens * costOutRate);
    let cents = (totalCostDollars * 100).toFixed(4); 
    
    let tBox = document.getElementById('think-box-' + aiMessageId);
    tBox.innerHTML = '<div class="tokens-cost-summary">' +
        '<span><i class="fa-solid fa-microchip"></i> رموز المدخلات: ' + inTokens + ' | المخرجات: ' + outTokens + '</span>' +
        '<span>التكلفة التقريبية: ¢' + cents + ' سنت</span>' +
    '</div>';
    
    let currentGlobal = parseFloat(document.getElementById('global-cost-display').innerText.replace(/[^0-9.]/g, '')) || 0;
    let newGlobal = (currentGlobal + parseFloat(cents)).toFixed(4);
    document.getElementById('global-cost-display').innerHTML = '<i class="fa-solid fa-wallet"></i> ¢' + newGlobal;
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    forceUpdatePreview();
}

function toggleInterfaceTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('devstudio_theme', newTheme);
}

function toggleInputVisibility(id) {
    const el = document.getElementById(id);
    el.type = el.type === 'password' ? 'text' : 'password';
}

function commitGlobalSettings() {
    localStorage.setItem('gemini_key', document.getElementById('input-gemini-key').value);
    localStorage.setItem('github_token', document.getElementById('input-github-token').value);
    alert('تم حفظ الإعدادات ومفاتيح الربط بنجاح!');
    switchMainTab('dev');
}

function copyCurrentCode() {
    const textarea = document.getElementById('code-editor-textarea');
    textarea.select();
    document.execCommand('copy');
    alert('تم نسخ الكود بنجاح!');
}

window.onload = function() {
    document.getElementById('code-editor-textarea').value = fileStorage[`${activeApp}-${activeCodeFile}`] || '';
    const savedTheme = localStorage.getItem('devstudio_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    if(localStorage.getItem('gemini_key')) document.getElementById('input-gemini-key').value = localStorage.getItem('gemini_key');
    if(localStorage.getItem('github_token')) document.getElementById('input-github-token').value = localStorage.getItem('github_token');
    
    forceUpdatePreview();
};
