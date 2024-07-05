import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { Toast, TOAST_TYPE } from '../../common/Toast';
import { isH5 } from '../../../utils/env';

type SavedNativeSelection = {
  anchorNode: Node | null;
  anchorOffset: number;
  focusNode: Node | null;
  focusOffset: number;
};

class CopyManager {
  private static instance: CopyManager;
  private savedSelection: SavedNativeSelection | null;

  private constructor() {
    this.savedSelection = null;
  }

  public static getInstance(): CopyManager {
    if (!CopyManager.instance) {
      CopyManager.instance = new CopyManager();
    }
    return CopyManager.instance;
  }

  public saveCurrentSelection() {
    const selection = window.getSelection();
    if (isH5 || !selection) {
      return;
    }
    this.savedSelection = {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset,
    };
  }

  private restoreSelection() {
    const selection = window.getSelection();
    if (isH5 || !selection || !this.savedSelection) {
      return;
    }

    const { anchorNode, anchorOffset, focusNode, focusOffset } = this.savedSelection;
    if (!anchorNode || !focusNode) {
      return;
    }

    const range = document.createRange();
    const isForwardSelection = anchorNode === focusNode
      ? anchorOffset <= focusOffset
      : anchorNode.compareDocumentPosition(focusNode) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (isForwardSelection) {
      range.setStart(anchorNode, anchorOffset);
      range.setEnd(focusNode, focusOffset);
    } else {
      range.setStart(focusNode, focusOffset);
      range.setEnd(anchorNode, anchorOffset);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  public async copySelection(defaultContent: string): Promise<void> {
    this.restoreSelection();

    const selection = window.getSelection();

    if (isH5 || !selection || selection.rangeCount === 0) {
      await this.copyTextOrHtml(defaultContent, 'text');
      return;
    }

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();

    const tempContainer = document.createElement('div');
    tempContainer.appendChild(fragment);
    const content = tempContainer.innerHTML || defaultContent;
    const type = tempContainer.innerHTML ? 'html' : 'text';

    await this.copyTextOrHtml(content, type);

    this.savedSelection = null;
  }

  public async copyTextOrHtml(content: string, type: 'text' | 'html'): Promise<void> {
    const mimeType = (type === 'html') ? 'text/html' : 'text/plain';
    // prefer use clipboard api to copy node or text
    if (navigator.clipboard) {
      try {
        const contentBlob = new Blob([content], { type: mimeType });
        const clipboardItem = new ClipboardItem({ [mimeType]: contentBlob });
        await navigator.clipboard.write([clipboardItem]);
        return;
      } catch (err) {
        // ignore error
      }
    }
    // if clipboard api not support, use document.execCommand
    let tempElement: HTMLTextAreaElement | HTMLDivElement;
    if (type === 'html') {
      tempElement = document.createElement('div');
      tempElement.style.position = 'fixed';
      tempElement.style.opacity = '0';
      tempElement.contentEditable = 'true';
      tempElement.innerHTML = content;
      document.body.appendChild(tempElement);
      const range = document.createRange();
      range.selectNodeContents(tempElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      tempElement.focus();
    } else {
      tempElement = document.createElement('textarea');
      tempElement.value = content;
      tempElement.style.position = 'fixed';
      document.body.appendChild(tempElement);
      tempElement.focus();
      tempElement.select();
    }

    try {
      document.execCommand('copy');
    } catch (err) {
      Toast({
        message: TUITranslateService.t('TUIChat.此机型暂不支持复制'),
        type: TOAST_TYPE.ERROR,
      });
      console.warn('use document.execCommand copy failed:', err);
    } finally {
      document.body.removeChild(tempElement);
    }
  }
}

export default CopyManager.getInstance();
