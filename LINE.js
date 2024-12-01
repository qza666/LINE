// 创建样式
const style = document.createElement('style');
style.textContent = `
  .textMessageContent-module__content_wrap__238E1 {
    position: relative;
  }
  .message-icons {
    position: absolute;
    top: -15px;
    right: 8px;
    display: none;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 4px 6px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .textMessageContent-module__content_wrap__238E1:hover .message-icons {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .message-icon {
    cursor: pointer;
    font-size: 20px;
    position: relative;
    padding: 4px;
    transition: transform 0.2s ease;
  }
  .message-icon:hover {
    transform: scale(1.1);
  }
  .message-icon:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 130%;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 12px;
    background-color: rgba(0, 0, 0, 0.85);
    color: white;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 1000;
    font-family: "Microsoft YaHei", sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    letter-spacing: 0.5px;
  }
  .message-icon:hover::before {
    content: '';
    position: absolute;
    bottom: calc(130% - 5px);
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
    z-index: 1000;
  }
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
  }
  .modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  #modal-text {
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #4A90E2;
    margin-top: 20px;
    font-family: KaiTi, 楷体;
    font-size: 16px;
    line-height: 1.6;
    user-select: text; /* 允许选中文本 */
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.3s ease;
}

.close:hover,
.close:focus {
    color: #2c3e50;
    text-decoration: none;
}

  
  /* Toast 样式 */
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-family: "Microsoft YaHei", sans-serif;
    z-index: 1001;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  /* 翻译文本样式 */
  .translated-text {
    color: #4A90E2;
    margin-top: 20px;
    font-family: KaiTi, 楷体;
    font-size: 14px;
    line-height: 1.6;
    padding: 8px;
    background-color: rgba(74, 144, 226, 0.1);
    border-radius: 6px;
    border-left: 3px solid #4A90E2;
  }

  /* 加载状态样式 */
  .loading-text {
    color: #666;
    font-style: italic;
    margin: 10px 0;
    font-family: "Microsoft YaHei", sans-serif;
  }

  /* 错误状态样式 */
  .error-message {
    color: #e74c3c;
    margin: 10px 0;
    padding: 8px;
    background-color: rgba(231, 76, 60, 0.1);
    border-radius: 4px;
    font-family: "Microsoft YaHei", sans-serif;
  }

  /* 重试按钮样式 */
  .retry-button {
    background-color: #4A90E2;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-family: "Microsoft YaHei", sans-serif;
    margin: 8px 0;
    transition: background-color 0.3s ease;
  }
  
  .retry-button:hover {
    background-color: #357ABD;
  }
`;
document.head.appendChild(style);

// 工具函数
const utils = {
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  async fetchResponse(text, path) {
    try {
      const response = await fetch(`https://trtrc.com/gpt.php?path=${path}&text=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data.result;
    } catch (error) {
      return '获取响应失败';
    }
  }
};

// 翻译相关函数
const translator = {
  getFromCache(message, path) {
    const cache = localStorage.getItem('translationCache');
    return cache ? JSON.parse(cache)[`${path}:${message}`] : null;
  },

  saveToCache(message, translation, path) {
    let cache = localStorage.getItem('translationCache') || '{}';
    let translations = JSON.parse(cache);
    translations[`${path}:${message}`] = translation;
    localStorage.setItem('translationCache', JSON.stringify(translations));
  },

  deleteFromCache(message, path) {
    let cache = localStorage.getItem('translationCache');
    if (cache) {
      let translations = JSON.parse(cache);
      delete translations[`${path}:${message}`];
      localStorage.setItem('translationCache', JSON.stringify(translations));
    }
  },

  async translate(text, path) {
    let translatedText = this.getFromCache(text, path);
    if (translatedText) return translatedText;
    try {
      const response = await fetch(`https://trtrc.com/gpt.php?path=${path}&text=${encodeURIComponent(text)}`);
      const data = await response.json();
      translatedText = data.result;
      this.saveToCache(text, translatedText, path);
      return translatedText;
    } catch (error) {
      return null;
    }
  }
};

// 消息处理函数
const messageHandler = {
  async translateMessage(span) {
    if (span.hasAttribute('data-translated')) return;

    let message = span.innerHTML.replace(/<span[^>]*>.*?<\/span>|<img[^>]*alt="([^"]+)"[^>]*>/g, '$1');
    let loadingMessage = document.createElement('p');
    loadingMessage.innerHTML = '翻译中.......';
    span.insertAdjacentElement('afterend', loadingMessage);

    try {
      let translatedMessage = await translator.translate(message, '1');
      loadingMessage.remove();

      if (translatedMessage) {
        let translatedMessageElement = document.createElement('p');
        translatedMessageElement.innerHTML = translatedMessage;
        translatedMessageElement.style.cssText = `
          color: #4A90E2;
          margin-top: 20px;
          font-family: KaiTi, 楷体;
          font-size: 14px;
        `;
        translatedMessageElement.setAttribute('data-translated', 'true');
        span.insertAdjacentElement('afterend', translatedMessageElement);
        span.setAttribute('data-translated', 'true');
      }
    } catch (error) {
      loadingMessage.remove();
      let errorMessage = document.createElement('p');
      errorMessage.innerHTML = `翻译失败: ${error.message}`;
      let retryButton = document.createElement('button');
      retryButton.innerText = '重新翻译';
      retryButton.onclick = () => this.translateMessage(span);
      span.insertAdjacentElement('afterend', errorMessage);
      span.insertAdjacentElement('afterend', retryButton);
    }
  },

  translateAllMessages: utils.debounce(() => {
    document.querySelectorAll('span[data-is-message-text="true"]:not([data-translated])').forEach(span => messageHandler.translateMessage(span));
  }, 500),

  addIconsToMessage(messageElement) {
    if (messageElement.querySelector('.message-icons')) return;
    
    const iconsContainer = document.createElement('div');
    iconsContainer.className = 'message-icons';
    iconsContainer.innerHTML = `
      <span class="message-icon" data-action="copy" title="复制原文">📑</span>
      <span class="message-icon" data-action="answer" title="智能回答">🤖</span>
      <span class="message-icon" data-action="topic" title="话题分析">🕵️‍♀️</span>
      <span class="message-icon" data-action="retry" title="重新翻译">🎯</span>
      <span class="message-icon" data-action="so" title="资料信息">🔍</span>
    `;
    messageElement.appendChild(iconsContainer);

    iconsContainer.querySelectorAll('.message-icon').forEach(icon => {
      icon.addEventListener('click', this.handleIconClick);
    });
  },

  async handleIconClick(event) {
    const action = event.target.getAttribute('data-action');
    const messageElement = event.target.closest('.textMessageContent-module__content_wrap__238E1');
    let originalText = messageElement.querySelector('span[data-is-message-text="true"]').innerHTML;
    // 移除 <span> 标签及其内容，和 <img> 标签中的 alt 属性
    originalText = originalText.replace(/<span[^>]*>.*?<\/span>|<img[^>]*alt="([^"]+)"[^>]*>/g, '$1');


    switch(action) {
      case 'copy':
        navigator.clipboard.writeText(originalText)
          .then(() => utils.showToast('原文已复制到剪贴板'))
          .catch(err => utils.showToast('复制失败: ' + err));
        break;
      case 'answer':
        updateEditBoxContent('智能回答思考中.....');
        updateEditBoxContent(await utils.fetchResponse(originalText, 6));
        break;
      case 'topic':
        showModal(await utils.fetchResponse(originalText, 7));
        break;
      case 'retry':
        const translatedElement = messageElement.querySelector('p[data-translated]');
        if (translatedElement) {
          translatedElement.textContent = '重新翻译中...';
          translator.deleteFromCache(originalText, '1');
          const newTranslation = await translator.translate(originalText, '1');
          translatedElement.textContent = newTranslation;
          translator.saveToCache(originalText, newTranslation, '1');
        }
        break;
      case 'so':
        showModal(await utils.fetchResponse(originalText, 5));
        break;
    }
  }
};

// 监控消息变化
const messageObserver = new MutationObserver((mutations) => {
  let shouldTranslate = false;
  for (let mutation of mutations) {
    if (mutation.type === 'childList') {
      const addedNodes = Array.from(mutation.addedNodes);
      addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const messageElement = node.matches('.textMessageContent-module__content_wrap__238E1') ? 
            node : node.querySelector('.textMessageContent-module__content_wrap__238E1');
          if (messageElement) {
            messageHandler.addIconsToMessage(messageElement);
          }
          if (node.matches('span[data-is-message-text="true"]') || 
              node.querySelector('span[data-is-message-text="true"]')) {
            shouldTranslate = true;
          }
        }
      });
    }
  }
  if (shouldTranslate) {
    messageHandler.translateAllMessages();
  }
});

// 初始化
function init() {
  messageObserver.observe(document.body, { childList: true, subtree: true });
  messageHandler.translateAllMessages();
  document.querySelectorAll('.textMessageContent-module__content_wrap__238E1').forEach(messageHandler.addIconsToMessage);
  
  // 编辑框监控（保持原有功能）
  function monitorTextarea() {
    function checkAndTranslate() {
      const textarea = document.querySelector("textarea-ex");
      if (textarea && textarea.shadowRoot) {
        const textDiv = textarea.shadowRoot.querySelector("div");
        if (textDiv) {
          const currentContent = textDiv.textContent;
          if (currentContent.includes('   ')) {
            updateEditBoxContent('翻译中.....');
            const textToTranslate = currentContent.replace('   ', '').trim();
            translator.translate(textToTranslate, '3').then(translatedContent => {
              if (translatedContent) {
                updateEditBoxContent(translatedContent);
              }
            });
          }
        }
      }
    }
    setInterval(checkAndTranslate, 1000);
  }
  
  monitorTextarea();
}

// 更新编辑框内容（保持原有功能）
function updateEditBoxContent(text) {
  const textarea = document.querySelector("textarea-ex").shadowRoot.querySelector("textarea");
  textarea.value = text;
  textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

// 模态框相关（保持原有功能）
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <p id="modal-text"></p>
  </div>
`;
document.body.appendChild(modal);

function showModal(content) {
  document.getElementById('modal-text').innerHTML = content;
  modal.style.display = 'block';
}

document.querySelector('.close').onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

// 启动脚本
init();

console.log('优化后的脚本已成功加载并执行');
