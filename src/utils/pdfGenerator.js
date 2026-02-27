import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * PDF生成工具类
 */
export class PDFGenerator {
  /**
   * 将HTML元素转换为PDF
   * @param {HTMLElement} element - 要转换的HTML元素
   * @param {Object} options - 配置选项
   * @param {string} options.filename - 文件名
   * @param {string} options.title - 文档标题
   * @param {string} options.format - 页面格式 (a4, letter等)
   * @param {string} options.orientation - 页面方向 (portrait, landscape)
   * @param {number} options.margin - 页面边距
   * @param {boolean} options.showHeader - 是否显示页眉
   * @param {boolean} options.showFooter - 是否显示页脚
   */
  static async generatePDF(element, options = {}) {
    const {
      filename = 'document.pdf',
      title = '文档',
      format = 'a4',
      orientation = 'portrait',
      margin = 10,
      showHeader = true,
      showFooter = true
    } = options

    try {
      // 显示加载提示
      const loading = this.showLoading('正在生成PDF...')

      // 获取元素尺寸
      const elementRect = element.getBoundingClientRect()
      const elementWidth = elementRect.width
      const elementHeight = elementRect.height

      // 创建PDF文档
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format
      })

      // 设置页面尺寸
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = pageHeight - (margin * 2)

      // 计算需要的页数
      const scale = contentWidth / elementWidth
      const scaledHeight = elementHeight * scale
      const pages = Math.ceil(scaledHeight / contentHeight)

      // 转换HTML为Canvas
      const canvas = await html2canvas(element, {
        scale: 2, // 提高清晰度
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: elementWidth,
        height: elementHeight
      })

      // 添加页面
      for (let i = 0; i < pages; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        // 计算当前页的裁剪区域
        const sourceY = i * (contentHeight / scale)
        const sourceHeight = Math.min(contentHeight / scale, elementHeight - sourceY)

        // 创建临时canvas来裁剪当前页内容
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        tempCanvas.width = elementWidth
        tempCanvas.height = sourceHeight

        // 裁剪当前页内容
        tempCtx.drawImage(
          canvas,
          0, sourceY, elementWidth, sourceHeight,
          0, 0, elementWidth, sourceHeight
        )

        // 添加页眉
        if (showHeader) {
          this.addHeader(pdf, title, pageWidth, margin)
        }

        // 添加内容
        const imgData = tempCanvas.toDataURL('image/png')
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          showHeader ? margin + 15 : margin,
          contentWidth,
          (sourceHeight * contentWidth) / elementWidth
        )

        // 添加页脚
        if (showFooter) {
          this.addFooter(pdf, i + 1, pages, pageWidth, pageHeight, margin)
        }
      }

      // 隐藏加载提示
      this.hideLoading(loading)

      // 下载PDF
      pdf.save(filename)

      return true
    } catch (error) {
      console.error('PDF生成失败:', error)
      this.hideLoading()
      throw error
    }
  }

  /**
   * 添加页眉
   * @param {jsPDF} pdf - PDF文档对象
   * @param {string} title - 标题
   * @param {number} pageWidth - 页面宽度
   * @param {number} margin - 边距
   */
  static addHeader(pdf, title, pageWidth, margin) {
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, pageWidth / 2, margin + 5, { align: 'center' })

    // 添加分隔线
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, margin + 10, pageWidth - margin, margin + 10)
  }

  /**
   * 添加页脚
   * @param {jsPDF} pdf - PDF文档对象
   * @param {number} currentPage - 当前页码
   * @param {number} totalPages - 总页数
   * @param {number} pageWidth - 页面宽度
   * @param {number} pageHeight - 页面高度
   * @param {number} margin - 边距
   */
  static addFooter(pdf, currentPage, totalPages, pageWidth, pageHeight, margin) {
    const footerY = pageHeight - margin

    // 添加页码
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(
      `第 ${currentPage} 页，共 ${totalPages} 页`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    )

    // 添加生成时间
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    pdf.text(
      `生成时间：${timeStr}`,
      margin,
      footerY,
      { align: 'left' }
    )
  }

  /**
   * 显示加载提示
   * @param {string} message - 提示信息
   * @returns {HTMLElement} 加载元素
   */
  static showLoading(message = '正在处理...') {
    // 创建加载遮罩
    const loadingMask = document.createElement('div')
    loadingMask.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `

    // 创建加载内容
    const loadingContent = document.createElement('div')
    loadingContent.style.cssText = `
      background: white;
      padding: 20px 30px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      text-align: center;
    `

    // 创建加载图标
    const loadingIcon = document.createElement('div')
    loadingIcon.style.cssText = `
      width: 32px;
      height: 32px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #409eff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    `

    // 创建加载文字
    const loadingText = document.createElement('div')
    loadingText.textContent = message
    loadingText.style.cssText = `
      color: #606266;
      font-size: 14px;
    `

    // 添加CSS动画
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)

    // 组装加载元素
    loadingContent.appendChild(loadingIcon)
    loadingContent.appendChild(loadingText)
    loadingMask.appendChild(loadingContent)
    document.body.appendChild(loadingMask)

    return loadingMask
  }

  /**
   * 隐藏加载提示
   * @param {HTMLElement} loadingElement - 加载元素
   */
  static hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.parentNode.removeChild(loadingElement)
    }
  }

  /**
   * 生成结算单PDF
   * @param {Object} orderData - 订单数据
   * @param {Object} settlementData - 结算数据
   * @param {Object} options - 配置选项
   */
  static async generateSettlementPDF(orderData, settlementData, options = {}) {
    const {
      filename = `结算单_${orderData.no || '未知订单'}_${new Date().getTime()}.pdf`,
      ...otherOptions
    } = options

    // 创建临时容器
    const container = document.createElement('div')
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 210mm;
      background: white;
    `
    document.body.appendChild(container)

    try {
      // 这里可以动态创建结算单HTML内容
      // 或者使用Vue组件渲染
      container.innerHTML = this.generateSettlementHTML(orderData, settlementData)

      // 生成PDF
      await this.generatePDF(container, {
        filename,
        title: '回收订单结算单',
        format: 'a4',
        orientation: 'portrait',
        margin: 15,
        showHeader: true,
        showFooter: true,
        ...otherOptions
      })
    } finally {
      // 清理临时容器
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  }

  /**
   * 生成结算单HTML内容（备用方案）
   * @param {Object} orderData - 订单数据
   * @param {Object} settlementData - 结算数据
   * @returns {string} HTML字符串
   */
  static generateSettlementHTML(orderData, settlementData) {
    return `
      <div style="padding: 20mm; font-family: SimSun, serif; font-size: 12px; line-height: 1.5;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin: 0;">回收订单结算单</h1>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p>订单编号：${orderData.no || '--'}</p>
              <p>订单类型：${orderData.type || '--'}</p>
              <p>合同编号：${orderData.contractNo || '--'}</p>
            </div>
            <div>
              <p>结算单号：${settlementData.settlementNo || '--'}</p>
              <p>结算日期：${new Date().toLocaleDateString()}</p>
              <p>经办人：${orderData.processor || '--'}</p>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">结算汇总</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>订单总金额：¥${(orderData.totalAmount || 0).toLocaleString()}</div>
            <div>本次结算金额：¥${(settlementData.currentAmount || 0).toLocaleString()}</div>
            <div>已走款金额：¥${(settlementData.paidAmount || 0).toLocaleString()}</div>
            <div>剩余未结算：¥${(settlementData.remainingAmount || 0).toLocaleString()}</div>
          </div>
        </div>
        
        <div style="margin-top: 40px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="text-align: center;">
              <div style="width: 150px; height: 1px; background: #333; margin: 0 auto 10px;"></div>
              <span>经办人签字</span>
            </div>
            <div style="text-align: center;">
              <div style="width: 150px; height: 1px; background: #333; margin: 0 auto 10px;"></div>
              <span>财务签字</span>
            </div>
            <div style="text-align: center;">
              <div style="width: 150px; height: 1px; background: #333; margin: 0 auto 10px;"></div>
              <span>负责人签字</span>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

export default PDFGenerator
