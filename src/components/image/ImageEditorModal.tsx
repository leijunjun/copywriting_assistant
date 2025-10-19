"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  backgroundColor?: string;
}

interface ImageOverlay {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  borderRadius?: number;
}

interface ImageEditorModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave?: (editedImageObject: any, designState: any) => void;
}

// 创建圆角矩形路径
const createRoundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export function ImageEditorModal({ imageUrl, onClose, onSave }: ImageEditorModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropConfirmed, setIsCropConfirmed] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [activeTool, setActiveTool] = useState<'crop' | 'text' | 'image' | 'paint'>('text');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [newTextSize, setNewTextSize] = useState(24);
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [newTextFont, setNewTextFont] = useState('Microsoft YaHei');
  const [customFontsLoaded, setCustomFontsLoaded] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 模糊工具状态
  const [blurRegions, setBlurRegions] = useState<Array<{x: number, y: number, width: number, height: number, blur: number}>>([]);
  const [isBlurring, setIsBlurring] = useState(false);
  const [blurBrushSize, setBlurBrushSize] = useState(20);
  const [blurIntensity, setBlurIntensity] = useState(10);
  
  // 涂改工具状态
  const [paintStrokes, setPaintStrokes] = useState<Array<{x: number, y: number, color: string, size: number}>>([]);
  const [isPainting, setIsPainting] = useState(false);
  const [paintBrushSize, setPaintBrushSize] = useState(10);
  const [paintColor, setPaintColor] = useState('#000000');
  const [isColorPicking, setIsColorPicking] = useState(false);
  
  // Canvas编辑相关状态
  const [hoverTextId, setHoverTextId] = useState<string | null>(null);
  const [hoverImageId, setHoverImageId] = useState<string | null>(null);
  const [canvasMousePos, setCanvasMousePos] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setIsImageLoading(false);
    const { width, height } = e.currentTarget;
    
    // 默认裁剪框覆盖整个图片
    if (aspect) {
      // 如果有比例限制，创建符合比例的裁剪框，尽可能覆盖更多区域
      setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 100 }, aspect, width, height), width, height));
    } else {
      // 如果没有比例限制，选择整个图片
      setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
    }
    
    // 设置图片的 crossOrigin 属性以避免 Canvas 污染
    const img = e.currentTarget;
    img.crossOrigin = 'anonymous';
    
    // 图片加载完成后，重绘Canvas
    setTimeout(() => {
      if (editCanvasRef.current) {
        drawEditCanvas().catch(console.error);
      }
    }, 100);
  }

  function onImageLoadStart() {
    setIsImageLoading(true);
  }

  // 获取实际的显示缩放比例（与HTML图片显示一致）
  const getActualDisplayScale = () => {
    if (!imgRef.current || !containerRef.current) return 1;
    
    const img = imgRef.current;
    const container = containerRef.current;
    
    // 检查图片是否已经完全加载
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      return 1;
    }
    
    // 获取容器的实际尺寸
    const containerRect = container.getBoundingClientRect();
    const maxWidth = containerRect.width;
    const maxHeight = containerRect.height;
    
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // 计算保持宽高比的最大缩放比例
    const scaleX = maxWidth / naturalWidth;
    const scaleY = maxHeight / naturalHeight;
    
    // 选择较小的缩放比例，确保图片完全适应容器
    return Math.min(scaleX, scaleY, 1);
  };

  // 获取显示尺寸（与HTML图片显示一致）
  const getDisplayDimensions = () => {
    if (!imgRef.current) return { width: 0, height: 0 };
    
    const img = imgRef.current;
    const scale = getActualDisplayScale();
    
    return {
      width: img.naturalWidth * scale,
      height: img.naturalHeight * scale
    };
  };

  // 从图片采集颜色
  const pickColorFromImage = (x: number, y: number) => {
    if (!editCanvasRef.current || !imgRef.current) return;
    
    const canvas = editCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 创建临时Canvas来获取像素数据
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = 1;
    tempCanvas.height = 1;
    
    // 绘制图片到临时Canvas
    tempCtx.drawImage(imgRef.current, 0, 0, 1, 1);
    
    // 获取像素数据
    const imageData = tempCtx.getImageData(0, 0, 1, 1);
    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];
    
    // 转换为十六进制颜色
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setPaintColor(hexColor);
    setIsColorPicking(false);
  };

  // 涂改工具处理
  const handlePaintStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'paint') return;
    
    const { x, y } = getCanvasMousePos(e);
    setIsPainting(true);
    
    // 添加涂改笔触
    const newStroke = {
      x,
      y,
      color: paintColor,
      size: paintBrushSize
    };
    
    setPaintStrokes([...paintStrokes, newStroke]);
  };

  const handlePaintMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || activeTool !== 'paint') return;
    
    const { x, y } = getCanvasMousePos(e);
    
    // 添加连续涂改笔触
    const newStroke = {
      x,
      y,
      color: paintColor,
      size: paintBrushSize
    };
    
    setPaintStrokes([...paintStrokes, newStroke]);
  };

  const handlePaintEnd = () => {
    setIsPainting(false);
  };

  // 清除所有涂改
  const clearPaintStrokes = () => {
    setPaintStrokes([]);
  };

  // 加载自定义字体
  const loadCustomFonts = async () => {
    const fonts = [
      {
        family: 'Smiley Sans',
        url: '/fonts/SmileySans-Oblique.ttf',
        weight: '400',
        style: 'normal'
      },
      {
        family: 'LXGW WenKai',
        url: '/fonts/LXGWWenKai-Regular.ttf',
        weight: '400',
        style: 'normal'
      },
      {
        family: 'TaoBao MaiCaiTi',
        url: '/fonts/TaoBaoMaiCaiTi-Regular.ttf',
        weight: '400',
        style: 'normal'
      },
      {
        family: 'DingTalk JinBuTi',
        url: '/fonts/DingTalkJinBuTi-Regular.ttf',
        weight: '400',
        style: 'normal'
      },
      {
        family: 'ZCOOL KuaiLe',
        url: '/fonts/站酷快乐体2016修订版.ttf',
        weight: '400',
        style: 'normal'
      }
    ];

    try {
      for (const font of fonts) {
        try {
          const fontFace = new FontFace(font.family, `url(${font.url})`, {
            weight: font.weight,
            style: font.style
          });
          
          await fontFace.load();
          document.fonts.add(fontFace);
          console.log(`字体 ${font.family} 加载成功`);
        } catch (error) {
          console.warn(`字体 ${font.family} 加载失败:`, error);
        }
      }
      setCustomFontsLoaded(true);
    } catch (error) {
      console.error('字体加载过程中出现错误:', error);
    }
  };

  // 统一的坐标转换函数
  const convertDisplayToNatural = (displayX: number, displayY: number) => {
    const scale = getActualDisplayScale();
    return {
      x: displayX / scale,
      y: displayY / scale
    };
  };

  // 碰撞检测函数
  const isPointInText = (x: number, y: number, textOverlay: TextOverlay): boolean => {
    if (!editCanvasRef.current) return false;
    
    const canvas = editCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // 设置字体以测量文本尺寸，添加字体回退机制
    const fontFamily = textOverlay.fontFamily;
    const fallbackFonts = {
      'Smiley Sans': 'Smiley Sans, "得意黑", Arial, sans-serif',
      'LXGW WenKai': 'LXGW WenKai, "霞鹜文楷", serif',
      'TaoBao MaiCaiTi': 'TaoBao MaiCaiTi, "淘宝买菜体", Arial, sans-serif',
      'DingTalk JinBuTi': 'DingTalk JinBuTi, "钉钉进步体", Arial, sans-serif',
      'ZCOOL KuaiLe': 'ZCOOL KuaiLe, "站酷快乐体", Arial, sans-serif',
      'Microsoft YaHei': 'Microsoft YaHei, "微软雅黑", Arial, sans-serif',
      'SimSun': 'SimSun, "宋体", serif',
      'SimHei': 'SimHei, "黑体", Arial, sans-serif',
      'KaiTi': 'KaiTi, "楷体", serif',
      'FangSong': 'FangSong, "仿宋", serif',
      'LiSu': 'LiSu, "隶书", serif',
      'YouYuan': 'YouYuan, "幼圆", Arial, sans-serif',
      'STSong': 'STSong, "华文宋体", serif',
      'STKaiti': 'STKaiti, "华文楷体", serif',
      'STHeiti': 'STHeiti, "华文黑体", Arial, sans-serif',
      'PingFang SC': 'PingFang SC, "苹方", Arial, sans-serif',
      'Hiragino Sans GB': 'Hiragino Sans GB, "冬青黑体", Arial, sans-serif',
      'Source Han Sans SC': 'Source Han Sans SC, "思源黑体", Arial, sans-serif',
      'Noto Sans SC': 'Noto Sans SC, "思源黑体", Arial, sans-serif'
    };
    
    const fontWithFallback = (fallbackFonts as any)[fontFamily] || fontFamily;
    ctx.font = `${textOverlay.fontSize}px ${fontWithFallback}`;
    const metrics = ctx.measureText(textOverlay.text);
    const textWidth = metrics.width;
    const textHeight = textOverlay.fontSize;
    
    // 计算基线到顶部的偏移量，与绘制时保持一致
    const baselineToTop = textOverlay.fontSize * 0.8;
    const adjustedY = textOverlay.y - baselineToTop;
    
    return x >= textOverlay.x && 
           x <= textOverlay.x + textWidth && 
           y >= adjustedY && 
           y <= adjustedY + textHeight;
  };

  const isPointInImage = (x: number, y: number, imageOverlay: ImageOverlay): boolean => {
    return x >= imageOverlay.x && 
           x <= imageOverlay.x + imageOverlay.width && 
           y >= imageOverlay.y && 
           y <= imageOverlay.y + imageOverlay.height;
  };

  const isPointInResizeHandle = (x: number, y: number, imageOverlay: ImageOverlay): boolean => {
    const handleSize = 12;
    const handleX = imageOverlay.x + imageOverlay.width - handleSize/2;
    const handleY = imageOverlay.y + imageOverlay.height - handleSize/2;
    
    return x >= handleX - handleSize/2 && 
           x <= handleX + handleSize/2 && 
           y >= handleY - handleSize/2 && 
           y <= handleY + handleSize/2;
  };

  // 光标样式管理
  const getCursorStyle = (): string => {
    if (isDragging) return 'move';
    if (isResizing) return 'se-resize';
    if (activeTool === 'blur') return 'crosshair';
    if (activeTool === 'paint') return 'crosshair';
    if (hoverTextId || hoverImageId) return 'pointer';
    return 'default';
  };

  // 根据比例动态调整裁剪框
  const updateCropForAspect = (newAspect: number | undefined) => {
    if (!imgRef.current) return;
    
    const { width, height } = imgRef.current;
    
    if (newAspect) {
      // 如果有比例限制，创建符合比例的裁剪框，尽可能覆盖更多区域
      const newCrop = centerCrop(makeAspectCrop({ unit: '%', width: 100 }, newAspect, width, height), width, height);
      setCrop(newCrop);
    } else {
      // 如果没有比例限制，选择整个图片
      setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
    }
    
    // 重置已完成的裁剪和确认状态
    setCompletedCrop(undefined);
    setIsCropConfirmed(false);
  };

  // 添加文字
  const addText = () => {
    if (!newText.trim()) return;
    
    // 确保当前工具是文字工具
    if (activeTool !== 'text') {
      setActiveTool('text');
    }
    
    // 使用Canvas坐标系统内的相对位置，优化文字显示位置
    let initialX = 50;
    let initialY = 100; // 向下移动，避免被遮挡
    
    if (editCanvasRef.current) {
      const canvas = editCanvasRef.current;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // 设置初始位置，考虑字体大小避免被遮挡
      initialX = Math.min(50, canvasWidth - 100);
      // 向下移动，确保文字完全可见，考虑字体大小
      const fontSize = newTextSize || 24;
      // 计算合适的Y位置：基础位置 + 字体大小，但不超过Canvas底部
      const baseY = Math.max(100, fontSize + 20); // 至少距离顶部100px或字体大小+20px
      initialY = Math.min(baseY, canvasHeight - fontSize - 20);
    }
    
    const newTextOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: newText,
      x: initialX,
      y: initialY,
      fontSize: newTextSize,
      color: newTextColor,
      fontFamily: newTextFont,
    };
    
    // 先更新状态
    const updatedTextOverlays = [...textOverlays, newTextOverlay];
    setTextOverlays(updatedTextOverlays);
    setNewText('');
    
    // 自动选择新添加的文字叠加层
    setSelectedTextId(newTextOverlay.id);
    setSelectedImageId(null);
    
    // 立即重绘Canvas，确保文字显示
    if (editCanvasRef.current && imgRef.current && imgRef.current.naturalWidth > 0) {
      console.log('立即重绘Canvas，新添加文字:', newTextOverlay.text, '文字数量:', updatedTextOverlays.length);
      // 使用更新后的状态立即重绘
      setTimeout(() => {
        drawEditCanvas(updatedTextOverlays).catch(console.error);
      }, 0);
    } else {
      console.log('Canvas或图片未准备好，无法立即重绘');
    }
    
    // 使用多重重绘机制确保文字显示
    requestAnimationFrame(() => {
      if (editCanvasRef.current && imgRef.current && imgRef.current.naturalWidth > 0) {
        console.log('requestAnimationFrame重绘Canvas，新添加文字:', newTextOverlay.text);
        drawEditCanvas(updatedTextOverlays).catch(console.error);
      }
    });
    
    // 额外的延迟重绘，确保状态更新完成
    setTimeout(() => {
      if (editCanvasRef.current && imgRef.current && imgRef.current.naturalWidth > 0) {
        console.log('setTimeout重绘Canvas，新添加文字:', newTextOverlay.text);
        drawEditCanvas(updatedTextOverlays).catch(console.error);
      }
    }, 50);
  };

  // 添加图片
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      // 使用Canvas坐标系统内的相对位置
      let initialX = 50;
      let initialY = 50;
      
      if (editCanvasRef.current) {
        const canvas = editCanvasRef.current;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // 设置初始位置为Canvas中心附近
        initialX = Math.min(50, canvasWidth - 100);
        initialY = Math.min(50, canvasHeight - 100);
      }
      
      const newImageOverlay: ImageOverlay = {
        id: Date.now().toString(),
        src: event.target?.result as string,
        x: initialX,
        y: initialY,
        width: 100,
        height: 100,
        borderRadius: 5, // 默认圆角半径5px
      };
      setImageOverlays([...imageOverlays, newImageOverlay]);
      
      // 自动选择新上传的图片叠加层
      setSelectedImageId(newImageOverlay.id);
      setSelectedTextId(null);
    };
    reader.readAsDataURL(file);
  };

  // 删除文字
  const deleteText = (id: string) => {
    setTextOverlays(textOverlays.filter((text: TextOverlay) => text.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // 删除图片
  const deleteImage = (id: string) => {
    setImageOverlays(imageOverlays.filter((img: ImageOverlay) => img.id !== id));
    if (selectedImageId === id) setSelectedImageId(null);
  };

  // 更新文字
  const updateText = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map((text: TextOverlay) => 
      text.id === id ? { ...text, ...updates } : text
    ));
  };

  // 更新图片
  const updateImage = (id: string, updates: Partial<ImageOverlay>) => {
    setImageOverlays(imageOverlays.map((img: ImageOverlay) => 
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  // 模糊工具处理
  const handleBlurStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'blur') return;
    
    const { x, y } = getCanvasMousePos(e);
    setIsBlurring(true);
    
    // 添加模糊区域
    const newBlurRegion = {
      x: x - blurBrushSize / 2,
      y: y - blurBrushSize / 2,
      width: blurBrushSize,
      height: blurBrushSize,
      blur: blurIntensity
    };
    
    setBlurRegions([...blurRegions, newBlurRegion]);
  };

  const handleBlurMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isBlurring || activeTool !== 'blur') return;
    
    const { x, y } = getCanvasMousePos(e);
    
    // 添加连续模糊区域
    const newBlurRegion = {
      x: x - blurBrushSize / 2,
      y: y - blurBrushSize / 2,
      width: blurBrushSize,
      height: blurBrushSize,
      blur: blurIntensity
    };
    
    setBlurRegions([...blurRegions, newBlurRegion]);
  };

  const handleBlurEnd = () => {
    setIsBlurring(false);
  };

  // 双击编辑文字
  const handleTextDoubleClick = (id: string) => {
    setEditingTextId(id);
    setIsEditingText(true);
    setSelectedTextId(id);
    setSelectedImageId(null);
  };

  // 双击编辑图片
  const handleImageDoubleClick = (id: string) => {
    setEditingImageId(id);
    setIsEditingImage(true);
    setSelectedImageId(id);
    setSelectedTextId(null);
  };

  // 关闭编辑模式
  const closeEditing = () => {
    setIsEditingText(false);
    setIsEditingImage(false);
    setEditingTextId(null);
    setEditingImageId(null);
  };

  // 图片缩放开始
  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const imageOverlay = imageOverlays.find((img: ImageOverlay) => img.id === id);
    if (!imageOverlay) return;
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: imageOverlay.width,
      height: imageOverlay.height
    });
    
    setSelectedImageId(id);
  };

  // 图片缩放中
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !selectedImageId) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(20, resizeStart.width + deltaX);
    const newHeight = Math.max(20, resizeStart.height + deltaY);
    
    updateImage(selectedImageId, { width: newWidth, height: newHeight });
  };

  // 图片缩放结束
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // 拖拽开始
  const handleDragStart = (e: React.MouseEvent, type: 'text' | 'image', id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 防止页面滚动
    document.body.style.userSelect = 'none';
    document.body.style.overflow = 'hidden';
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (type === 'text') {
      setSelectedTextId(id);
      const textOverlay = textOverlays.find((t: TextOverlay) => t.id === id);
      if (textOverlay) {
        setDragOffset({ x: e.clientX - textOverlay.x, y: e.clientY - textOverlay.y });
      }
    } else {
      setSelectedImageId(id);
      const imageOverlay = imageOverlays.find((img: ImageOverlay) => img.id === id);
      if (imageOverlay) {
        setDragOffset({ x: e.clientX - imageOverlay.x, y: e.clientY - imageOverlay.y });
      }
    }
  };

  // 拖拽中
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    if (selectedTextId) {
      updateText(selectedTextId, { x: newX, y: newY });
    } else if (selectedImageId) {
      updateImage(selectedImageId, { x: newX, y: newY });
    }
  };

  // 拖拽结束
  const handleDragEnd = () => {
    // 恢复页面状态
    document.body.style.userSelect = '';
    document.body.style.overflow = '';
    
    setIsDragging(false);
    // 保持选中状态，不自动取消
    // setSelectedTextId(null);
    // setSelectedImageId(null);
  };

  // Canvas鼠标事件处理
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editCanvasRef.current) return { x: 0, y: 0 };
    
    const canvas = editCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 计算Canvas的实际尺寸与显示尺寸的比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasMousePos(e);
    setCanvasMousePos({ x, y });
    
    // 检查是否点击在缩放手柄上
    if (selectedImageId) {
      const imageOverlay = imageOverlays.find((img: ImageOverlay) => img.id === selectedImageId);
      if (imageOverlay && isPointInResizeHandle(x, y, imageOverlay)) {
        handleResizeStart(e, selectedImageId);
        return;
      }
    }
    
    // 检查是否点击在文本上
    for (const textOverlay of textOverlays) {
      if (isPointInText(x, y, textOverlay)) {
        handleDragStart(e, 'text', textOverlay.id);
        return;
      }
    }
    
    // 检查是否点击在图片上
    for (const imageOverlay of imageOverlays) {
      if (isPointInImage(x, y, imageOverlay)) {
        handleDragStart(e, 'image', imageOverlay.id);
        return;
      }
    }
    
    // 模糊工具处理
    if (activeTool === 'blur') {
      handleBlurStart(e);
      return;
    }
    
    // 涂改工具处理
    if (activeTool === 'paint') {
      handlePaintStart(e);
      return;
    }
    
    // 如果点击在空白区域，取消选择
    setSelectedTextId(null);
    setSelectedImageId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasMousePos(e);
    setCanvasMousePos({ x, y });
    
    if (isDragging) {
      handleDragMove(e);
      return;
    }
    
    // 模糊工具处理
    if (isBlurring && activeTool === 'blur') {
      handleBlurMove(e);
      return;
    }
    
    // 涂改工具处理
    if (isPainting && activeTool === 'paint') {
      handlePaintMove(e);
      return;
    }
    
    // 更新悬停状态
    let newHoverTextId: string | null = null;
    let newHoverImageId: string | null = null;
    
    // 检查悬停在文本上
    for (const textOverlay of textOverlays) {
      if (isPointInText(x, y, textOverlay)) {
        newHoverTextId = textOverlay.id;
        break;
      }
    }
    
    // 检查悬停在图片上
    for (const imageOverlay of imageOverlays) {
      if (isPointInImage(x, y, imageOverlay)) {
        newHoverImageId = imageOverlay.id;
        break;
      }
    }
    
    setHoverTextId(newHoverTextId);
    setHoverImageId(newHoverImageId);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleDragEnd();
    } else if (isResizing) {
      handleResizeEnd();
    } else if (isBlurring) {
      handleBlurEnd();
    } else if (isPainting) {
      handlePaintEnd();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 如果正在拖拽，不处理点击事件
    if (isDragging || isResizing) return;
    
    const { x, y } = getCanvasMousePos(e);
    
    // 检查点击在文本上
    for (const textOverlay of textOverlays) {
      if (isPointInText(x, y, textOverlay)) {
        setSelectedTextId(textOverlay.id);
        setSelectedImageId(null);
        return;
      }
    }
    
    // 检查点击在图片上
    for (const imageOverlay of imageOverlays) {
      if (isPointInImage(x, y, imageOverlay)) {
        setSelectedImageId(imageOverlay.id);
        setSelectedTextId(null);
        return;
      }
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 如果正在拖拽，不处理双击事件
    if (isDragging || isResizing) return;
    
    const { x, y } = getCanvasMousePos(e);
    
    // 检查双击在文本上
    for (const textOverlay of textOverlays) {
      if (isPointInText(x, y, textOverlay)) {
        handleTextDoubleClick(textOverlay.id);
        return;
      }
    }
    
    // 检查双击在图片上
    for (const imageOverlay of imageOverlays) {
      if (isPointInImage(x, y, imageOverlay)) {
        handleImageDoubleClick(imageOverlay.id);
        return;
      }
    }
  };

  // 组件挂载时加载自定义字体
  useEffect(() => {
    loadCustomFonts();
  }, []);

  // 鼠标移动事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        if (selectedTextId) {
          updateText(selectedTextId, { x: newX, y: newY });
        } else if (selectedImageId) {
          updateImage(selectedImageId, { x: newX, y: newY });
        }
      } else if (isResizing) {
        handleResizeMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      } else if (isResizing) {
        handleResizeEnd();
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, selectedTextId, selectedImageId, dragOffset]);

  // 确保在组件卸载时重置拖拽状态
  useEffect(() => {
    return () => {
      setIsDragging(false);
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
    };
  }, []);

  // 绘制编辑Canvas
  const drawEditCanvas = async (forceTextOverlays?: TextOverlay[]) => {
    console.log('drawEditCanvas函数开始执行');
    
    if (!editCanvasRef.current || !imgRef.current) {
      console.log('Canvas或图片引用不存在，跳过绘制');
      return;
    }
    
    // 使用传入的文字叠加层或当前状态
    const currentTextOverlays = forceTextOverlays || textOverlays;
    console.log('使用文字叠加层数量:', currentTextOverlays.length);

    const canvas = editCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('无法获取Canvas上下文，跳过绘制');
      return;
    }

    const img = imgRef.current;
    
    // 检查图片是否已经完全加载
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.log('图片还未完全加载，跳过Canvas绘制');
      return;
    }
    
    console.log('开始绘制编辑Canvas，图片尺寸:', img.naturalWidth, 'x', img.naturalHeight);
    
    const displayDims = getDisplayDimensions();
    const displayWidth = displayDims.width;
    const displayHeight = displayDims.height;
    
    // 设置Canvas尺寸
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // 设置Canvas的CSS尺寸，确保与内部尺寸一致
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // 清空画布
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    try {
      // 绘制基础图片
      ctx.drawImage(
        img,
        0, 0, img.naturalWidth, img.naturalHeight,
        0, 0, displayWidth, displayHeight
      );
      
      // 绘制模糊区域
      blurRegions.forEach((region: {x: number, y: number, width: number, height: number, blur: number}) => {
        ctx.save();
        ctx.filter = `blur(${region.blur}px)`;
        ctx.drawImage(
          img,
          region.x, region.y, region.width, region.height,
          region.x, region.y, region.width, region.height
        );
        ctx.restore();
      });
      
      // 绘制涂改笔触
      paintStrokes.forEach((stroke: {x: number, y: number, color: string, size: number}) => {
        ctx.save();
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(stroke.x, stroke.y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // 绘制文字叠加层
      console.log('绘制文字叠加层，数量:', currentTextOverlays.length);
      currentTextOverlays.forEach((textOverlay: TextOverlay) => {
        console.log('绘制文字:', textOverlay.text, '位置:', textOverlay.x, textOverlay.y, '字体大小:', textOverlay.fontSize);
        ctx.save();
        
        // 应用缩放和旋转
        if (scale !== 1 || rotate !== 0) {
          ctx.translate(textOverlay.x, textOverlay.y);
          ctx.scale(scale, scale);
          ctx.rotate((rotate * Math.PI) / 180);
          ctx.translate(-textOverlay.x, -textOverlay.y);
        }
        
        // 设置字体和颜色，添加字体回退机制
        const fontFamily = textOverlay.fontFamily;
        const fallbackFonts = {
          'Smiley Sans': 'Smiley Sans, "得意黑", Arial, sans-serif',
          'LXGW WenKai': 'LXGW WenKai, "霞鹜文楷", serif',
          'TaoBao MaiCaiTi': 'TaoBao MaiCaiTi, "淘宝买菜体", Arial, sans-serif',
          'DingTalk JinBuTi': 'DingTalk JinBuTi, "钉钉进步体", Arial, sans-serif',
          'ZCOOL KuaiLe': 'ZCOOL KuaiLe, "站酷快乐体", Arial, sans-serif',
          'Microsoft YaHei': 'Microsoft YaHei, "微软雅黑", Arial, sans-serif',
          'SimSun': 'SimSun, "宋体", serif',
          'SimHei': 'SimHei, "黑体", Arial, sans-serif',
          'KaiTi': 'KaiTi, "楷体", serif',
          'FangSong': 'FangSong, "仿宋", serif',
          'LiSu': 'LiSu, "隶书", serif',
          'YouYuan': 'YouYuan, "幼圆", Arial, sans-serif',
          'STSong': 'STSong, "华文宋体", serif',
          'STKaiti': 'STKaiti, "华文楷体", serif',
          'STHeiti': 'STHeiti, "华文黑体", Arial, sans-serif',
          'PingFang SC': 'PingFang SC, "苹方", Arial, sans-serif',
          'Hiragino Sans GB': 'Hiragino Sans GB, "冬青黑体", Arial, sans-serif',
          'Source Han Sans SC': 'Source Han Sans SC, "思源黑体", Arial, sans-serif',
          'Noto Sans SC': 'Noto Sans SC, "思源黑体", Arial, sans-serif'
        };
        
        const fontWithFallback = (fallbackFonts as any)[fontFamily] || fontFamily;
        ctx.font = `${textOverlay.fontSize}px ${fontWithFallback}`;
        ctx.fillStyle = textOverlay.color;
        
        // 计算基线到顶部的偏移量，使Canvas文字位置与HTML div位置一致
        const baselineToTop = textOverlay.fontSize * 0.8;
        const adjustedY = textOverlay.y - baselineToTop;
        
        console.log('文字绘制调试:', {
          text: textOverlay.text,
          originalY: textOverlay.y,
          fontSize: textOverlay.fontSize,
          baselineToTop: baselineToTop,
          adjustedY: adjustedY
        });
        
        // 绘制背景色
        if (textOverlay.backgroundColor) {
          const textWidth = ctx.measureText(textOverlay.text).width;
          const textHeight = textOverlay.fontSize;
          const padding = 4; // 背景色内边距
          
          ctx.fillStyle = textOverlay.backgroundColor;
          ctx.fillRect(
            textOverlay.x - padding,
            adjustedY - textHeight + padding,
            textWidth + padding * 2,
            textHeight + padding * 2
          );
        }
        ctx.fillStyle = textOverlay.color; // Reset fillStyle for text
        
        // 绘制文字
        console.log('正在绘制文字:', textOverlay.text, '位置:', textOverlay.x, adjustedY);
        ctx.fillText(textOverlay.text, textOverlay.x, adjustedY);
        console.log('文字绘制完成:', textOverlay.text);
        
        // 绘制选中边框
        if (selectedTextId === textOverlay.id) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.strokeRect(textOverlay.x - 2, adjustedY - textOverlay.fontSize + 2, 
                        ctx.measureText(textOverlay.text).width + 4, textOverlay.fontSize + 4);
        }
        
        // 绘制悬停边框
        if (hoverTextId === textOverlay.id && selectedTextId !== textOverlay.id) {
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 1;
          ctx.strokeRect(textOverlay.x - 1, adjustedY - textOverlay.fontSize + 1, 
                        ctx.measureText(textOverlay.text).width + 2, textOverlay.fontSize + 2);
        }
        
        ctx.restore();
      });
      
      // 绘制图片叠加层
      const imagePromises = imageOverlays.map((imageOverlay: ImageOverlay) => {
        return new Promise<void>((resolve) => {
          const overlayImg = new Image();
          overlayImg.crossOrigin = 'anonymous';
          overlayImg.onload = () => {
            try {
              ctx.save();
              
              // 应用阴影效果
              if (imageOverlay.shadowColor) {
                ctx.shadowColor = imageOverlay.shadowColor;
                ctx.shadowBlur = imageOverlay.shadowBlur || 0;
                ctx.shadowOffsetX = imageOverlay.shadowOffsetX || 0;
                ctx.shadowOffsetY = imageOverlay.shadowOffsetY || 0;
              }
              
              // 应用缩放和旋转
              if (scale !== 1 || rotate !== 0) {
                ctx.translate(imageOverlay.x + imageOverlay.width/2, imageOverlay.y + imageOverlay.height/2);
                ctx.scale(scale, scale);
                ctx.rotate((rotate * Math.PI) / 180);
                ctx.translate(-imageOverlay.width/2, -imageOverlay.height/2);
                
                // 如果有圆角设置，创建圆角路径并裁剪
                if (imageOverlay.borderRadius && imageOverlay.borderRadius > 0) {
                  createRoundedRectPath(ctx, 0, 0, imageOverlay.width, imageOverlay.height, imageOverlay.borderRadius);
                  ctx.clip();
                }
                
                ctx.drawImage(overlayImg, 0, 0, imageOverlay.width, imageOverlay.height);
              } else {
                // 如果有圆角设置，创建圆角路径并裁剪
                if (imageOverlay.borderRadius && imageOverlay.borderRadius > 0) {
                  createRoundedRectPath(ctx, imageOverlay.x, imageOverlay.y, imageOverlay.width, imageOverlay.height, imageOverlay.borderRadius);
                  ctx.clip();
                }
                
                ctx.drawImage(overlayImg, imageOverlay.x, imageOverlay.y, imageOverlay.width, imageOverlay.height);
              }
              
              // 绘制选中边框
              if (selectedImageId === imageOverlay.id) {
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.strokeRect(imageOverlay.x - 2, imageOverlay.y - 2, 
                              imageOverlay.width + 4, imageOverlay.height + 4);
                
                // 绘制缩放手柄
                const handleSize = 12;
                const handleX = imageOverlay.x + imageOverlay.width - handleSize/2;
                const handleY = imageOverlay.y + imageOverlay.height - handleSize/2;
                
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(handleX - handleSize/2, handleY - handleSize/2, handleSize, handleSize);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(handleX - handleSize/2, handleY - handleSize/2, handleSize, handleSize);
              }
              
              // 绘制悬停边框
              if (hoverImageId === imageOverlay.id && selectedImageId !== imageOverlay.id) {
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 1;
                ctx.strokeRect(imageOverlay.x - 1, imageOverlay.y - 1, 
                              imageOverlay.width + 2, imageOverlay.height + 2);
              }
              
              ctx.restore();
            } catch (error) {
              console.warn('Failed to draw overlay image in edit canvas:', error);
            }
            resolve();
          };
          overlayImg.onerror = () => {
            console.warn('Failed to load overlay image:', imageOverlay.src);
            resolve();
          };
          overlayImg.src = imageOverlay.src;
        });
      });
      
      await Promise.all(imagePromises);
      
      // 绘制拖拽/缩放提示
      if (isDragging) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.fillRect(10, 10, 100, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('拖拽中...', 15, 30);
      }
      
      if (isResizing) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.fillRect(10, 10, 100, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('缩放中...', 15, 30);
      }
    } catch (error) {
      console.error('Error drawing edit canvas:', error);
    }
  };

  // 绘制最终图片
  const drawFinalImage = async () => {
    if (!imgRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    
    // 使用统一的显示尺寸计算（与HTML图片显示一致）
    const displayDims = getDisplayDimensions();
    const displayWidth = displayDims.width;
    const displayHeight = displayDims.height;
    
    // 确定画布尺寸 - 如果有裁剪区域则使用裁剪区域，否则使用显示尺寸
    let canvasWidth, canvasHeight;
    let sourceX = 0, sourceY = 0, sourceWidth, sourceHeight;
    
    if (completedCrop) {
      canvasWidth = completedCrop.width;
      canvasHeight = completedCrop.height;
      // 使用统一的坐标转换函数
      const naturalCoords = convertDisplayToNatural(completedCrop.x, completedCrop.y);
      const naturalSize = convertDisplayToNatural(completedCrop.width, completedCrop.height);
      sourceX = naturalCoords.x;
      sourceY = naturalCoords.y;
      sourceWidth = naturalSize.x;
      sourceHeight = naturalSize.y;
    } else {
      canvasWidth = displayWidth;
      canvasHeight = displayHeight;
      sourceX = 0;
      sourceY = 0;
      sourceWidth = img.naturalWidth;
      sourceHeight = img.naturalHeight;
    }
    
    // 检查是否正在下载，如果是则使用原始尺寸，否则限制预览宽度
    const isDownloading = document.querySelector('[data-downloading="true"]') !== null;
    let previewWidth, previewHeight;
    
    if (isDownloading) {
      // 下载时使用原始尺寸，不压缩
      previewWidth = canvasWidth;
      previewHeight = canvasHeight;
    } else {
      // 预览时限制宽度，防止超出右侧板块
      const maxPreviewWidth = 350;
      previewWidth = Math.min(canvasWidth, maxPreviewWidth);
      previewHeight = (canvasHeight * previewWidth) / canvasWidth;
    }
    
    canvas.width = previewWidth;
    canvas.height = previewHeight;
    
    // 设置Canvas的CSS尺寸，确保与内部尺寸一致
    canvas.style.width = `${previewWidth}px`;
    canvas.style.height = `${previewHeight}px`;
    
    try {
      // 绘制基础图片
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, previewWidth, previewHeight
      );
      
      // 绘制模糊区域
      blurRegions.forEach((region: {x: number, y: number, width: number, height: number, blur: number}) => {
        ctx.save();
        ctx.filter = `blur(${region.blur}px)`;
        
        // 计算模糊区域在画布中的位置，按比例缩放
        const scaleX = previewWidth / canvasWidth;
        const scaleY = previewHeight / canvasHeight;
        
        let blurX = region.x * scaleX;
        let blurY = region.y * scaleY;
        const blurWidth = region.width * scaleX;
        const blurHeight = region.height * scaleY;
        
        // 如果有裁剪，需要调整位置
        if (completedCrop) {
          blurX = (region.x - completedCrop.x) * scaleX;
          blurY = (region.y - completedCrop.y) * scaleY;
        }
        
        ctx.drawImage(
          img,
          sourceX + region.x, sourceY + region.y, region.width, region.height,
          blurX, blurY, blurWidth, blurHeight
        );
        ctx.restore();
      });
      
      // 绘制涂改笔触
      const scaleX = previewWidth / canvasWidth;
      const scaleY = previewHeight / canvasHeight;
      
      paintStrokes.forEach((stroke: {x: number, y: number, color: string, size: number}) => {
        ctx.save();
        ctx.fillStyle = stroke.color;
        
        // 计算涂改笔触在画布中的位置，按比例缩放
        let paintX = stroke.x * scaleX;
        let paintY = stroke.y * scaleY;
        const paintSize = stroke.size * Math.min(scaleX, scaleY);
        
        // 如果有裁剪，需要调整位置
        if (completedCrop) {
          paintX = (stroke.x - completedCrop.x) * scaleX;
          paintY = (stroke.y - completedCrop.y) * scaleY;
        }
        
        ctx.beginPath();
        ctx.arc(paintX, paintY, paintSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // 绘制文字叠加层
      textOverlays.forEach((textOverlay: TextOverlay) => {
        ctx.save();
        
        // 计算文字在画布中的实际位置，按比例缩放
        const scaleX = previewWidth / canvasWidth;
        const scaleY = previewHeight / canvasHeight;
        
        let textX = textOverlay.x * scaleX;
        let textY = textOverlay.y * scaleY;
        
        // 如果有裁剪，需要调整位置
        if (completedCrop) {
          textX = (textOverlay.x - completedCrop.x) * scaleX;
          textY = (textOverlay.y - completedCrop.y) * scaleY;
        }
        
        // 应用缩放和旋转（与左侧显示保持一致）
        if (scale !== 1 || rotate !== 0) {
          ctx.translate(textX, textY);
          ctx.scale(scale, scale);
          ctx.rotate((rotate * Math.PI) / 180);
          ctx.translate(-textX, -textY);
        }
        
        // 按比例缩放字体大小
        const scaledFontSize = textOverlay.fontSize * Math.min(scaleX, scaleY);
        ctx.font = `${scaledFontSize}px ${textOverlay.fontFamily}`;
        ctx.fillStyle = textOverlay.color;
        ctx.fillText(textOverlay.text, textX, textY);
        
        ctx.restore();
      });
      
      // 绘制图片叠加层 - 等待所有图片加载完成
      const imagePromises = imageOverlays.map((imageOverlay: ImageOverlay) => {
        return new Promise<void>((resolve) => {
          const overlayImg = new Image();
          overlayImg.crossOrigin = 'anonymous';
          overlayImg.onload = () => {
            try {
              ctx.save();
              
              // 计算图片在画布中的实际位置，按比例缩放
              const scaleX = previewWidth / canvasWidth;
              const scaleY = previewHeight / canvasHeight;
              
              let imgX = imageOverlay.x * scaleX;
              let imgY = imageOverlay.y * scaleY;
              const imgWidth = imageOverlay.width * scaleX;
              const imgHeight = imageOverlay.height * scaleY;
              
              // 如果有裁剪，需要调整位置
              if (completedCrop) {
                imgX = (imageOverlay.x - completedCrop.x) * scaleX;
                imgY = (imageOverlay.y - completedCrop.y) * scaleY;
              }
              
              // 应用缩放和旋转（与左侧显示保持一致）
              if (scale !== 1 || rotate !== 0) {
                ctx.translate(imgX + imgWidth/2, imgY + imgHeight/2);
                ctx.scale(scale, scale);
                ctx.rotate((rotate * Math.PI) / 180);
                ctx.translate(-imgWidth/2, -imgHeight/2);
                imgX = 0;
                imgY = 0;
              }
              
              // 如果有圆角设置，创建圆角路径并裁剪
              if (imageOverlay.borderRadius && imageOverlay.borderRadius > 0) {
                createRoundedRectPath(ctx, imgX, imgY, imgWidth, imgHeight, imageOverlay.borderRadius);
                ctx.clip();
              }
              
              ctx.drawImage(
                overlayImg,
                imgX, imgY, imgWidth, imgHeight
              );
              
              ctx.restore();
            } catch (error) {
              console.warn('Failed to draw overlay image:', error);
            }
            resolve();
          };
          overlayImg.onerror = () => {
            console.warn('Failed to load overlay image:', imageOverlay.src);
            resolve();
          };
          overlayImg.src = imageOverlay.src;
        });
      });
      
      await Promise.all(imagePromises);
    } catch (error) {
      console.error('Error drawing final image:', error);
    }
  };

  // 实时预览功能：在裁剪框调整时显示实时预览
  const drawRealTimePreview = async (currentCrop: Crop | undefined) => {
    if (!previewCanvasRef.current || !imgRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const displayDims = getDisplayDimensions();
    
    // 如果有当前裁剪框，显示裁剪预览
    if (currentCrop && !isCropConfirmed) {
      canvas.width = currentCrop.width;
      canvas.height = currentCrop.height;
      
      // 设置Canvas的CSS尺寸，确保与内部尺寸一致
      canvas.style.width = `${currentCrop.width}px`;
      canvas.style.height = `${currentCrop.height}px`;
      
      // 使用统一的坐标转换
      const naturalCoords = convertDisplayToNatural(currentCrop.x, currentCrop.y);
      const naturalSize = convertDisplayToNatural(currentCrop.width, currentCrop.height);
      
      // 绘制基础图片
      ctx.drawImage(
        img,
        naturalCoords.x, naturalCoords.y, naturalSize.x, naturalSize.y,
        0, 0, currentCrop.width, currentCrop.height
      );
      
      // 绘制文字叠加层
      textOverlays.forEach((textOverlay: TextOverlay) => {
        ctx.save();
        
        // 计算文字在画布中的实际位置
        let textX = textOverlay.x;
        let textY = textOverlay.y;
        
        // 调整位置相对于裁剪区域
        textX = textOverlay.x - currentCrop.x;
        textY = textOverlay.y - currentCrop.y;
        
        // 应用缩放和旋转（与左侧显示保持一致）
        if (scale !== 1 || rotate !== 0) {
          ctx.translate(textX, textY);
          ctx.scale(scale, scale);
          ctx.rotate((rotate * Math.PI) / 180);
          ctx.translate(-textX, -textY);
        }
        
        ctx.font = `${textOverlay.fontSize}px ${textOverlay.fontFamily}`;
        ctx.fillStyle = textOverlay.color;
        
        // 计算基线到顶部的偏移量，使Canvas文字位置与HTML div位置一致
        const baselineToTop = textOverlay.fontSize * 0.8;
        const adjustedY = textY - baselineToTop;
        
        ctx.fillText(textOverlay.text, textX, adjustedY);
        
        ctx.restore();
      });
      
      // 绘制图片叠加层
      const imagePromises = imageOverlays.map((imageOverlay: ImageOverlay) => {
        return new Promise<void>((resolve) => {
          const overlayImg = new Image();
          overlayImg.crossOrigin = 'anonymous';
          overlayImg.onload = () => {
            try {
              ctx.save();
              
              // 计算图片在画布中的实际位置
              let imgX = imageOverlay.x;
              let imgY = imageOverlay.y;
              const imgWidth = imageOverlay.width;
              const imgHeight = imageOverlay.height;
              
              // 调整位置相对于裁剪区域
              imgX = imageOverlay.x - currentCrop.x;
              imgY = imageOverlay.y - currentCrop.y;
              
              // 应用缩放和旋转（与左侧显示保持一致）
              if (scale !== 1 || rotate !== 0) {
                ctx.translate(imgX + imgWidth/2, imgY + imgHeight/2);
                ctx.scale(scale, scale);
                ctx.rotate((rotate * Math.PI) / 180);
                ctx.translate(-imgWidth/2, -imgHeight/2);
                imgX = 0;
                imgY = 0;
              }
              
              ctx.drawImage(
                overlayImg,
                imgX, imgY, imgWidth, imgHeight
              );
              
              ctx.restore();
            } catch (error) {
              console.warn('Failed to draw overlay image in preview:', error);
            }
            resolve();
          };
          overlayImg.onerror = () => {
            console.warn('Failed to load overlay image:', imageOverlay.src);
            resolve();
          };
          overlayImg.src = imageOverlay.src;
        });
      });
      
      await Promise.all(imagePromises);
    } else {
      // 否则显示完整图片
      await drawFinalImage();
    }
  };

  useEffect(() => {
    drawFinalImage();
  }, [textOverlays, imageOverlays, completedCrop, scale, rotate, blurRegions, paintStrokes]);

  // 编辑Canvas重绘优化
  useEffect(() => {
    console.log('drawEditCanvas useEffect触发，activeTool:', activeTool, 'textOverlays数量:', textOverlays.length);
    if (activeTool !== 'crop') {
      console.log('开始执行drawEditCanvas');
      drawEditCanvas().catch(console.error);
    } else {
      console.log('跳过drawEditCanvas，因为activeTool是crop');
    }
  }, [
    textOverlays, 
    imageOverlays, 
    selectedTextId, 
    selectedImageId,
    hoverTextId,
    hoverImageId,
    isDragging,
    isResizing,
    scale,
    rotate,
    activeTool,
    blurRegions,
    paintStrokes
  ]);

  // 实时预览：当裁剪框变化时显示实时预览
  useEffect(() => {
    if (activeTool === 'crop' && crop && !isCropConfirmed) {
      drawRealTimePreview(crop);
    }
  }, [crop, isCropConfirmed, activeTool]);

  async function onDownloadCropClick() {
    if (!previewCanvasRef.current) return;

    setIsDownloading(true);
    
    // 设置下载标记，让drawFinalImage知道正在下载
    const downloadButton = document.querySelector('[data-downloading]');
    if (downloadButton) {
      downloadButton.setAttribute('data-downloading', 'true');
    }
    
    try {
      // 先重新绘制最终图片，确保所有叠加层都已绘制
      await drawFinalImage();
      
      const canvas = previewCanvasRef.current;
    
    try {
      // 尝试使用 toBlob 方法
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob: Blob | null) => {
            resolve(blob);
          }, 'image/png', 1.0);
        });
      
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (onSave) {
          onSave({ imageBase64: canvas.toDataURL() }, {});
        }
      } else {
        throw new Error('Failed to create blob');
      }
    } catch (error) {
      console.error('Canvas toBlob failed:', error);
      
      // 备用方案：使用 toDataURL
      try {
        const dataURL = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (onSave) {
          onSave({ imageBase64: dataURL }, {});
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        alert('保存失败：图片可能包含跨域内容，请尝试使用其他图片或联系技术支持。');
      }
    }
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">图片编辑器</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={onDownloadCropClick}
              disabled={isDownloading}
              data-downloading={isDownloading ? "true" : "false"}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  合并下载中
                </>
              ) : (
                '合并并下载'
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl ml-2"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* 主体内容 - 左右分栏 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧预览区 */}
          <div className="flex-[3] p-4 overflow-auto bg-blue-50">
            <div className="h-full flex flex-col">
              {/* 图片编辑区域 */}
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
                {/* 图片加载提示 */}
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">图片正在赶来的路上...</p>
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  {activeTool === 'crop' ? (
                    React.createElement(ReactCrop as any, {
                      crop: crop,
                      onChange: (_: any, percentCrop: any) => {
                        setCrop(percentCrop);
                        setIsCropConfirmed(false); // 调整时取消确认状态
                      },
                      onComplete: (c: any) => {
                        setCompletedCrop(c);
                        setIsCropConfirmed(true); // 完成时自动确认
                      },
                      aspect: aspect,
                      minWidth: 50,
                      minHeight: 50
                    },
                      React.createElement('img', {
                        ref: imgRef,
                        alt: "Crop me",
                        src: imageUrl,
                        crossOrigin: "anonymous",
                        style: { 
                          transform: `scale(${scale}) rotate(${rotate}deg)`,
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain'
                        },
                        onLoad: onImageLoad,
                        onLoadStart: onImageLoadStart
                      })
                    )
                  ) : (
                    <div 
                      ref={containerRef}
                      className="relative"
                    >
                      <img
                        ref={imgRef}
                        alt="Edit me"
                        src={imageUrl}
                        crossOrigin="anonymous"
                        style={{ 
                          transform: `scale(${scale}) rotate(${rotate}deg)`,
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                        onLoad={onImageLoad}
                        onLoadStart={onImageLoadStart}
                      />
                      
                      {/* Canvas编辑层 */}
                      <canvas
                        ref={editCanvasRef}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onClick={handleCanvasClick}
                        onDoubleClick={handleCanvasDoubleClick}
                        style={{ 
                          cursor: getCursorStyle(),
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 50,
                          pointerEvents: 'auto'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
          
          {/* 右侧操作区 */}
          <div className="flex-[1] min-w-[280px] max-w-[400px] border-l p-3 overflow-auto bg-green-50">
            {/* 工具切换 */}
            <div className="mb-3">
              <h3 className="text-base font-medium mb-2">工具</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTool('text')}
                  className={`px-3 py-2 text-sm rounded ${activeTool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  加字
                </button>
                <button
                  onClick={() => setActiveTool('image')}
                  className={`px-3 py-2 text-sm rounded ${activeTool === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  加图
                </button>
                <button
                  onClick={() => setActiveTool('blur')}
                  className={`px-3 py-2 text-sm rounded ${activeTool === 'blur' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  模糊
                </button>
                <button
                  onClick={() => setActiveTool('paint')}
                  className={`px-3 py-2 text-sm rounded ${activeTool === 'paint' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  涂改
                </button>
              </div>
            </div>

            {/* 工具控制面板 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium">控制面板</h3>
                <button
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                >
                  {isPanelCollapsed ? '展开' : '收缩'}
                </button>
              </div>
              
              {!isPanelCollapsed && (
                <div className="space-y-4">
                  {/* 裁剪工具控制面板 */}
                  {activeTool === 'crop' && (
                    <div className="space-y-4">
                      {/* 状态指示器 */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">裁剪工具</h3>
                        {isCropConfirmed ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            ✓ 已确认裁剪
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            ⚠ 未确认裁剪
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">缩放: {Math.round(scale * 100)}%</label>
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={scale}
                          onChange={(e) => setScale(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">旋转: {rotate}°</label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={rotate}
                          onChange={(e) => setRotate(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">比例</label>
                        <select
                          value={aspect}
                          onChange={(e) => {
                            const newAspect = e.target.value ? Number(e.target.value) : undefined;
                            setAspect(newAspect);
                            // 动态调整裁剪框
                            updateCropForAspect(newAspect);
                          }}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="">自由</option>
                          <option value={1}>1:1</option>
                          <option value={16/9}>16:9</option>
                          <option value={4/3}>4:3</option>
                          <option value={3/4}>3:4</option>
                          <option value={9/16}>9:16</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateCropForAspect(aspect)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                        >
                          重置裁剪框
                        </button>
                        <button
                          onClick={() => {
                            if (crop) {
                              setCompletedCrop(crop);
                              setIsCropConfirmed(true);
                            }
                          }}
                          disabled={!crop || isCropConfirmed}
                          className={`px-4 py-2 rounded whitespace-nowrap ${
                            isCropConfirmed 
                              ? 'bg-green-700 text-white cursor-not-allowed' 
                              : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                          }`}
                        >
                          {isCropConfirmed ? '已确认裁剪' : '确认裁剪'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 文字工具控制面板 */}
                  {activeTool === 'text' && (
                    <div className="space-y-4">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="输入文字..."
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          className="border rounded px-3 py-2 flex-1 min-w-0"
                        />
                        <button
                          onClick={addText}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap flex-shrink-0"
                        >
                          添加
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">字体大小</label>
                          <input
                            type="number"
                            value={newTextSize}
                            onChange={(e) => setNewTextSize(Number(e.target.value))}
                            className="border rounded px-2 py-1 w-full"
                            min="8"
                            max="72"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">颜色</label>
                          <input
                            type="color"
                            value={newTextColor}
                            onChange={(e) => setNewTextColor(e.target.value)}
                            className="w-full h-10 border rounded"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">字体</label>
                          <select
                            value={newTextFont}
                            onChange={(e) => setNewTextFont(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                          >
                            {/* 自定义字体 */}
                            <option value="Smiley Sans">得意黑 Smiley Sans</option>
                            <option value="LXGW WenKai">霞鹜文楷 LXGW WenKai</option>
                            <option value="TaoBao MaiCaiTi">淘宝买菜体 TaoBao MaiCaiTi</option>
                            <option value="DingTalk JinBuTi">钉钉进步体 DingTalk JinBuTi</option>
                            <option value="ZCOOL KuaiLe">站酷快乐体 ZCOOL KuaiLe</option>
                            
                            {/* 中文字体 */}
                            <option value="Microsoft YaHei">微软雅黑</option>
                            <option value="SimSun">宋体</option>
                            <option value="SimHei">黑体</option>
                            <option value="KaiTi">楷体</option>
                            <option value="FangSong">仿宋</option>
                            <option value="LiSu">隶书</option>
                            <option value="YouYuan">幼圆</option>
                            <option value="STSong">华文宋体</option>
                            <option value="STKaiti">华文楷体</option>
                            <option value="STHeiti">华文黑体</option>
                            
                            {/* 英文字体 */}
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                            
                            {/* 系统字体 */}
                            <option value="PingFang SC">苹方</option>
                            <option value="Hiragino Sans GB">冬青黑体</option>
                            <option value="Source Han Sans SC">思源黑体</option>
                            <option value="Noto Sans SC">思源黑体</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* 文字列表 */}
                      {textOverlays.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">已添加的文字:</h4>
                          {textOverlays.map((text: TextOverlay) => (
                            <div 
                              key={text.id} 
                              className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                                selectedTextId === text.id ? 'bg-blue-50 border-blue-300' : ''
                              }`}
                              onClick={() => {
                                setSelectedTextId(text.id);
                                setSelectedImageId(null);
                              }}
                            >
                              <span className="flex-1 min-w-0 truncate">{text.text}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteText(text.id);
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded text-sm whitespace-nowrap flex-shrink-0"
                              >
                                删除
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 图片工具控制面板 */}
                  {activeTool === 'image' && (
                    <div className="space-y-4">
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
                        >
                          添加二维码/配图
                        </button>
                      </div>
                      
                      {/* 图片列表 */}
                      {imageOverlays.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">已添加的图片:</h4>
                          {imageOverlays.map((img: ImageOverlay) => (
                            <div 
                              key={img.id} 
                              className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                                selectedImageId === img.id ? 'bg-green-50 border-green-300' : ''
                              }`}
                              onClick={() => {
                                setSelectedImageId(img.id);
                                setSelectedTextId(null);
                              }}
                            >
                              <img src={img.src} alt="overlay" className="w-12 h-12 object-cover rounded flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-600 truncate">
                                  {Math.round(img.width)} × {Math.round(img.height)}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteImage(img.id);
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded text-sm whitespace-nowrap flex-shrink-0"
                              >
                                删除
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 模糊工具控制面板 */}
                  {activeTool === 'blur' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-3">模糊工具</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          在图片上拖拽鼠标来添加模糊效果
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">画笔大小</label>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            value={blurBrushSize}
                            onChange={(e) => setBlurBrushSize(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{blurBrushSize}px</span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">模糊强度</label>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={blurIntensity}
                            onChange={(e) => setBlurIntensity(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{blurIntensity}px</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBlurRegions([])}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          清除所有模糊
                        </button>
                        <button
                          onClick={() => {
                            if (blurRegions.length > 0) {
                              setBlurRegions(blurRegions.slice(0, -1));
                            }
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          撤销上一步
                        </button>
                      </div>
                      
                      {blurRegions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">模糊区域 ({blurRegions.length})</h4>
                          <div className="text-xs text-gray-600">
                            已添加 {blurRegions.length} 个模糊区域
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 涂改工具控制面板 */}
                  {activeTool === 'paint' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-3">涂改工具</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          在图片上拖拽鼠标来涂改，支持颜色采集
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">画笔大小</label>
                          <input
                            type="range"
                            min="2"
                            max="50"
                            value={paintBrushSize}
                            onChange={(e) => setPaintBrushSize(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{paintBrushSize}px</span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">涂改颜色</label>
                          <input
                            type="color"
                            value={paintColor}
                            onChange={(e) => setPaintColor(e.target.value)}
                            className="w-full h-10 border rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      
                      <div className="flex gap-2">
                        <button
                          onClick={clearPaintStrokes}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          清除所有涂改
                        </button>
                        <button
                          onClick={() => {
                            if (paintStrokes.length > 0) {
                              setPaintStrokes(paintStrokes.slice(0, -1));
                            }
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          撤销上一步
                        </button>
                      </div>
                      
                      {paintStrokes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">涂改笔触 ({paintStrokes.length})</h4>
                          <div className="text-xs text-gray-600">
                            已添加 {paintStrokes.length} 个涂改笔触
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 预览区域 */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-medium">预览</h3>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  最终合成以预览效果为准
                </span>
              </div>
              <canvas
                ref={previewCanvasRef}
                style={{
                  border: '1px solid black',
                  width: '100%',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 文字编辑弹窗 */}
      {isEditingText && editingTextId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">编辑文字</h3>
              <button
                onClick={closeEditing}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {(() => {
              const selectedText = textOverlays.find((t: TextOverlay) => t.id === editingTextId);
              if (!selectedText) return null;
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">文字内容</label>
                    <input
                      type="text"
                      value={selectedText.text}
                      onChange={(e) => updateText(editingTextId, { text: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">位置 X</label>
                      <input
                        type="number"
                        value={Math.round(selectedText.x)}
                        onChange={(e) => updateText(editingTextId, { x: Number(e.target.value) })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">位置 Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedText.y)}
                        onChange={(e) => updateText(editingTextId, { y: Number(e.target.value) })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">字体大小</label>
                      <input
                        type="number"
                        value={selectedText.fontSize}
                        onChange={(e) => updateText(editingTextId, { fontSize: Number(e.target.value) })}
                        className="w-full border rounded px-2 py-1"
                        min="8"
                        max="72"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">颜色</label>
                      <input
                        type="color"
                        value={selectedText.color}
                        onChange={(e) => updateText(editingTextId, { color: e.target.value })}
                        className="w-full h-10 border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">字体</label>
                    <select
                      value={selectedText.fontFamily}
                      onChange={(e) => updateText(editingTextId, { fontFamily: e.target.value })}
                      className="w-full border rounded px-2 py-1"
                    >
                      {/* 自定义字体 */}
                      <option value="Smiley Sans">得意黑 Smiley Sans</option>
                      <option value="LXGW WenKai">霞鹜文楷 LXGW WenKai</option>
                      <option value="TaoBao MaiCaiTi">淘宝买菜体 TaoBao MaiCaiTi</option>
                      <option value="DingTalk JinBuTi">钉钉进步体 DingTalk JinBuTi</option>
                      <option value="ZCOOL KuaiLe">站酷快乐体 ZCOOL KuaiLe</option>
                      
                      {/* 中文字体 */}
                      <option value="Microsoft YaHei">微软雅黑</option>
                      <option value="SimSun">宋体</option>
                      <option value="SimHei">黑体</option>
                      <option value="KaiTi">楷体</option>
                      <option value="FangSong">仿宋</option>
                      <option value="LiSu">隶书</option>
                      <option value="YouYuan">幼圆</option>
                      <option value="STSong">华文宋体</option>
                      <option value="STKaiti">华文楷体</option>
                      <option value="STHeiti">华文黑体</option>
                      
                      {/* 英文字体 */}
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      
                      {/* 系统字体 */}
                      <option value="PingFang SC">苹方</option>
                      <option value="Hiragino Sans GB">冬青黑体</option>
                      <option value="Source Han Sans SC">思源黑体</option>
                      <option value="Noto Sans SC">思源黑体</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        deleteText(editingTextId);
                        closeEditing();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-1"
                    >
                      删除
                    </button>
                    <button
                      onClick={closeEditing}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-1"
                    >
                      完成
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      
      {/* 图片编辑弹窗 */}
      {isEditingImage && editingImageId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">编辑图片</h3>
              <button
                onClick={closeEditing}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {(() => {
              const selectedImage = imageOverlays.find((img: ImageOverlay) => img.id === editingImageId);
              if (!selectedImage) return null;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">位置 X</label>
                      <input
                        type="number"
                        value={Math.round(selectedImage.x)}
                        onChange={(e) => updateImage(editingImageId, { x: Number(e.target.value) })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">位置 Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedImage.y)}
                        onChange={(e) => updateImage(editingImageId, { y: Number(e.target.value) })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">宽度</label>
                      <input
                        type="number"
                        value={selectedImage.width}
                        onChange={(e) => updateImage(editingImageId, { width: Number(e.target.value) })}
                        className="w-full border rounded px-2 py-1"
                        min="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">高度</label>
                      <input
                        type="number"
                        value={selectedImage.height}
                        onChange={(e) => updateImage(editingImageId, { height: Number(e.target.value) })}
                        className="w-full border rounded px-2 py-1"
                        min="10"
                      />
                    </div>
                  </div>
                  
                  {/* 阴影设置 */}
                  <div className="space-y-3">
                    <h4 className="font-medium">阴影设置</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">阴影颜色</label>
                        <input
                          type="color"
                          value={selectedImage.shadowColor || '#000000'}
                          onChange={(e) => updateImage(editingImageId, { shadowColor: e.target.value })}
                          className="w-full h-10 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">模糊半径</label>
                        <input
                          type="number"
                          value={selectedImage.shadowBlur || 0}
                          onChange={(e) => updateImage(editingImageId, { shadowBlur: Number(e.target.value) })}
                          className="w-full border rounded px-2 py-1"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">X偏移</label>
                        <input
                          type="number"
                          value={selectedImage.shadowOffsetX || 0}
                          onChange={(e) => updateImage(editingImageId, { shadowOffsetX: Number(e.target.value) })}
                          className="w-full border rounded px-2 py-1"
                          min="-50"
                          max="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Y偏移</label>
                        <input
                          type="number"
                          value={selectedImage.shadowOffsetY || 0}
                          onChange={(e) => updateImage(editingImageId, { shadowOffsetY: Number(e.target.value) })}
                          className="w-full border rounded px-2 py-1"
                          min="-50"
                          max="50"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => updateImage(editingImageId, { 
                        shadowColor: undefined, 
                        shadowBlur: undefined, 
                        shadowOffsetX: undefined, 
                        shadowOffsetY: undefined 
                      })}
                      className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      清除阴影
                    </button>
                  </div>
                  
                  {/* 圆角设置 */}
                  <div className="space-y-3">
                    <h4 className="font-medium">圆角设置</h4>
                    <div>
                      <label className="block text-sm font-medium mb-1">圆角半径</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={selectedImage.borderRadius || 0}
                        onChange={(e) => updateImage(editingImageId, { borderRadius: Number(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{selectedImage.borderRadius || 0}px</span>
                    </div>
                    <button
                      onClick={() => updateImage(editingImageId, { borderRadius: 0 })}
                      className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      重置为直角
                    </button>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        deleteImage(editingImageId);
                        closeEditing();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-1"
                    >
                      删除
                    </button>
                    <button
                      onClick={closeEditing}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-1"
                    >
                      完成
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}