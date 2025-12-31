
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Sparkles, Image as ImageIcon, Package, Send, Loader2, 
  Clock, ChevronRight, Upload, Coins, 
  CreditCard, Layout, Smartphone as PhoneIcon, X, Save, Archive, ClipboardList,
  Heart, TrendingUp, Trash2, Copy, Wallet, ShoppingCart, Truck, CheckCircle2, Box,
  User as UserIcon, Palette, Eye, RotateCcw, ShieldCheck
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Category, AppLayer, DesignState, User, SavedArtwork, OrderStatus, CartItem } from './types';
import { CATEGORIES, DESIGN_STYLES } from './constants';

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<AppLayer>(AppLayer.DESIGN);
  const [user, setUser] = useState<User>({ phone: '', points: 0, gold: 0, isLoggedIn: false });
  const [showLogin, setShowLogin] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [galleryTab, setGalleryTab] = useState<'personal' | 'public'>('public');
  
  const [design, setDesign] = useState<DesignState>({
    artworkUrl: null,
    mockupUrls: [],
    prompt: '',
    style: '',
    refImage: null,
    category: Category.PHONECASE,
    aspectRatio: '9:16',
    sourceArtworkId: undefined
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColorId, setSelectedColorId] = useState<string>('white');
  const [orders, setOrders] = useState<OrderStatus[]>([]);
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentCategory = useMemo(() => CATEGORIES.find(c => c.id === design.category), [design.category]);
  const currentMaterial = useMemo(() => {
    return currentCategory?.options.materials.find(m => m.id === (selectedMaterialId || currentCategory.options.materials[0].id));
  }, [currentCategory, selectedMaterialId]);

  const priceInfo = useMemo(() => (currentCategory?.basePrice || 0) + (currentMaterial?.priceOffset || 0), [currentCategory, currentMaterial]);
  const leadTimeInfo = useMemo(() => `${3 + (currentMaterial?.timeOffset || 0)}-${5 + (currentMaterial?.timeOffset || 0)}个工作日`, [currentMaterial]);

  useEffect(() => {
    const apiKey = process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("API_KEY missing - please configure GEMINI_API_KEY in environment variables");
    } else {
      console.log("✅ API Key configured");
    }
  }, []);

  const handleLogin = () => {
    if (!user.phone) return;
    setUser({ ...user, isLoggedIn: true, points: 2000, gold: 500 });
    setShowLogin(false);
  };

  const handleSaveToWorks = () => {
    if (!design.artworkUrl) return;
    const newArt: SavedArtwork = {
      id: 'ART-' + Date.now(),
      url: design.artworkUrl,
      prompt: design.prompt,
      category: design.category,
      timestamp: Date.now(),
      isPublic: false,
      likes: 0,
      creator: user.phone || 'AI_MEMBER',
      orderCount: 0
    };
    setSavedArtworks(prev => [newArt, ...prev]);
    alert("已保存至设计画廊");
  };

  const handleArchiveToCart = () => {
    if (!design.artworkUrl) return;
    const newItem: CartItem = {
      id: 'CART-' + Date.now(),
      image: design.mockupUrls[0] || design.artworkUrl,
      prompt: design.prompt,
      category: design.category,
      timestamp: Date.now()
    };
    setCartItems(prev => [...prev, newItem]);
    alert("已加入备产清单");
  };

  const handlePlaceOrder = () => {
    if (!user.isLoggedIn) { setShowLogin(true); return; }
    const newOrderId = 'C2M-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    const now = new Date().toLocaleString();
    
    const newOrder: OrderStatus = {
      id: newOrderId,
      category: design.category,
      productName: currentCategory?.name || '',
      status: 'PRODUCING',
      timestamp: now,
      image: design.mockupUrls[0] || design.artworkUrl || '',
      logistics: {
        step: 1,
        updates: [{ time: now, msg: "C2M 工厂已接收设计数据，正在初始化生产环境" }]
      }
    };
    setOrders(prev => [newOrder, ...prev]);
    setActiveLayer(AppLayer.TRACKING);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setDesign(prev => ({ ...prev, refImage: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  // 场景化渲染逻辑核心
  const handleFinalPreview = async () => {
    if (!design.artworkUrl) return;
    setIsPreviewing(true);
    try {
      const apiKey = process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not configured");
      const ai = new GoogleGenAI({ apiKey });
      const colorName = currentCategory?.options.colors?.find(c => c.id === selectedColorId)?.name || '白色';
      
      let previewPrompt = `Generate a ultra-realistic 4K lifestyle photography for a ${currentCategory?.name}.`;
      
      if (design.category === Category.TSHIRT) {
        previewPrompt = `Premium 4K fashion photography of a ${colorName} ROUND-NECK SHORT-SLEEVE T-SHIRT (strictly no hoodies). LEFT HALF: Professional model wearing the T-shirt in a minimalist studio. RIGHT HALF: Front and back views stacked vertically. High-end cotton texture.`;
      } else if (design.category === Category.PHONECASE) {
        previewPrompt = `High-end lifestyle 4K photography of a smartphone case featuring the source design. Scene: The phone is held by a hand or placed on a textured cafe table with a cup of coffee. Beautiful natural sunlight and aesthetic depth of field. Precise edge-to-edge design application.`;
      } else if (design.category === Category.MOUSEPAD) {
        previewPrompt = `Professional 4K desktop workspace scene photography. A large RECTANGULAR MOUSEPAD with the source design is laid on a clean desk. A high-end mechanical keyboard and a gaming mouse are positioned on top of the mousepad. Modern laptop in background. No bags.`;
      } else if (design.category === Category.BEDDING) {
        previewPrompt = `Luxury 4K interior photography of a designer bedding set in a high-end modern bedroom. Cinematic lighting, soft shadows. The design is elegantly applied to the duvet and pillows.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { inlineData: { mimeType: 'image/png', data: design.artworkUrl.split(',')[1] } }, 
            { text: previewPrompt }
          ] 
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const newMockups = response.candidates[0].content.parts
        .filter(part => part.inlineData)
        .map(part => `data:image/png;base64,${part.inlineData!.data}`);

      if (newMockups.length > 0) setDesign(prev => ({ ...prev, mockupUrls: newMockups }));
    } catch (e) {
      alert("场景预览渲染失败，AI 引擎正忙。");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    if (!user.isLoggedIn) { setShowLogin(true); return; }
    if (user.points < 10) { setShowPay(true); return; }
    if (!design.prompt) return;

    setIsGenerating(true);
    try {
      const apiKey = process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not configured");
      const ai = new GoogleGenAI({ apiKey });
      const stylePrompt = DESIGN_STYLES.find(s => s.id === design.style)?.prompt || '';
      
      let productTerm = currentCategory?.name;
      if (design.category === Category.TSHIRT) productTerm = "Round-neck Short-sleeve T-shirt (No hoodies)";
      
      const designPrompt = `Masterpiece professional graphic design for a ${productTerm}. 
      Theme: ${design.prompt}. Style: ${stylePrompt}. 
      World-class artistic composition, sophisticated visual hierarchy, high-end designer aesthetic. 
      The design must be high-resolution, detailed, and cover the entire product surface if possible.`;

      const contents: any[] = [];
      if (design.refImage) contents.push({ inlineData: { mimeType: 'image/jpeg', data: design.refImage.split(',')[1] } });
      contents.push({ text: designPrompt });

      const artResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: contents },
        config: { imageConfig: { aspectRatio: (currentCategory?.aspectRatio || '1:1') as any } }
      });

      let mainArt = '';
      for (const part of artResponse.candidates[0].content.parts) {
        if (part.inlineData) { mainArt = `data:image/png;base64,${part.inlineData.data}`; break; }
      }
      if (!mainArt) throw new Error("Artwork failed");

      // 初步场景效果展示
      let initialMockPrompt = `Realistic lifestyle scene mockup for ${currentCategory?.name}.`;
      if (design.category === Category.TSHIRT) {
        initialMockPrompt = `Professional ROUND-NECK SHORT-SLEEVE T-SHIRT fashion photography. Model + flat-lay views. NO HOODIES.`;
      } else if (design.category === Category.MOUSEPAD) {
        initialMockPrompt = `Clean office desk scene with a RECTANGULAR computer mousepad. Keyboard and mouse included. Professional lighting.`;
      } else if (design.category === Category.PHONECASE) {
        initialMockPrompt = `Aesthetic real-world lifestyle photo of a phone case. Café table setting or handheld. Natural light.`;
      }

      const mockupResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ inlineData: { mimeType: 'image/png', data: mainArt.split(',')[1] } }, { text: initialMockPrompt }] 
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const mockups = mockupResponse.candidates[0].content.parts
        .filter(p => p.inlineData)
        .map(p => `data:image/png;base64,${p.inlineData!.data}`);

      setDesign(prev => ({ ...prev, artworkUrl: mainArt, mockupUrls: mockups }));
      setUser(prev => ({ ...prev, points: prev.points - 10 }));
    } catch (e) {
      alert("AI 引擎异常，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderDesignLayer = () => (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col min-h-0 relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-indigo-400">概念原稿 (设计图)</span>
            {design.artworkUrl && <button onClick={handleSaveToWorks} className="p-1 hover:bg-gray-100 rounded-lg"><Save className="w-4 h-4 text-indigo-500" /></button>}
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative cursor-zoom-in" onClick={() => design.artworkUrl && setZoomedImage(design.artworkUrl)}>
            {design.artworkUrl ? <img src={design.artworkUrl} className="max-h-full max-w-full object-contain" /> : <div className="text-gray-300 text-[11px] text-center"><Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />输入文字或灵感开启 C2M 设计</div>}
            {isGenerating && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-black uppercase text-indigo-400">场景化现实效果展示</span></div>
          <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {design.mockupUrls.length > 0 ? design.mockupUrls.map((m, i) => (
              <div key={i} className="aspect-video bg-gray-50 rounded-xl overflow-hidden cursor-zoom-in group relative border border-gray-100" onClick={() => setZoomedImage(m)}>
                <img src={m} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-[8px] text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">Scene Preview</div>
              </div>
            )) : <div className="h-full flex flex-col items-center justify-center text-gray-300 text-[11px] border-2 border-dashed border-gray-50 rounded-xl uppercase font-black tracking-widest space-y-2"><ImageIcon className="w-6 h-6 opacity-20" /><span>Workspace / Lifestyle</span></div>}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 space-y-3">
        <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setDesign({...design, category: c.id})} className={`flex-shrink-0 flex items-center space-x-1 px-4 py-2 rounded-full border transition-all ${design.category === c.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{c.icon}<span className="text-[10px] font-bold">{c.name}</span></button>
          ))}
        </div>
        <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-1">
          {DESIGN_STYLES.map(s => (
            <button key={s.id} onClick={() => setDesign({...design, style: s.id})} className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] border transition-all font-black ${design.style === s.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{s.name}</button>
          ))}
        </div>

        <div className="flex space-x-2 items-end">
          <div className="flex-1 relative">
            <textarea value={design.prompt} onChange={(e) => setDesign({...design, prompt: e.target.value})} placeholder="描述灵感，AI将自动渲染产品在办公或生活场景下的实拍图..." className="w-full h-14 p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none resize-none text-[12px] font-medium" />
            {design.refImage && <div className="absolute top-2 right-2 group"><img src={design.refImage} className="w-8 h-8 rounded-lg border-2 border-white shadow-md object-cover" /><button onClick={() => setDesign({...design, refImage: null})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-2 h-2" /></button></div>}
          </div>
          <div className="flex flex-col space-y-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"><Upload className="w-4 h-4 text-gray-400" /></button>
            <button onClick={() => handleGenerate()} disabled={isGenerating || !design.prompt} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-95 transition-all"><Send className="w-5 h-5" /></button>
          </div>
        </div>
        
        {design.artworkUrl && (
          <div className="flex space-x-2 pt-1">
             <button onClick={handleArchiveToCart} className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[11px] flex items-center justify-center space-x-1">
               <Archive className="w-4 h-4" /> <span>备产库</span>
             </button>
             <button onClick={() => setActiveLayer(AppLayer.PRODUCT)} className="flex-[2] py-3 bg-black text-white rounded-2xl font-black text-[11px] flex items-center justify-center space-x-1">
               <span>配置规格下单</span><ChevronRight className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductLayer = () => (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105">
           <img src={design.mockupUrls[0] || design.artworkUrl || ''} className="w-64 min-h-[160px] object-cover" />
           {isPreviewing && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 space-y-2">
              <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">场景化高精渲染中...</span>
           </div>}
           <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1.5 rounded-xl text-[10px] font-black text-indigo-600 shadow-xl border border-indigo-50">场景效果</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 bg-white p-8 rounded-t-[3rem] shadow-2xl border-t border-indigo-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-800">定制规格 / SKU</h2>
          <div className="text-right">
             <div className="text-2xl font-black text-indigo-600">¥{priceInfo}</div>
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{leadTimeInfo}</div>
          </div>
        </div>
        
        <div className="space-y-5">
          {currentCategory?.options.colors && (
            <div className="space-y-3">
               <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest"><Palette className="w-3.5 h-3.5 mr-2" /> 选定基础色</div>
               <div className="flex space-x-4">
                 {currentCategory.options.colors.map(color => (
                   <button key={color.id} onClick={() => setSelectedColorId(color.id)} className={`flex items-center p-2 rounded-2xl border-2 transition-all ${selectedColorId === color.id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-50'}`}>
                      <div className="w-6 h-6 rounded-full border border-gray-200 shadow-inner mr-2" style={{ backgroundColor: color.value }}></div>
                      <span className="text-[10px] font-black">{color.name}</span>
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {currentCategory?.options.materials.map(m => (
              <button key={m.id} onClick={() => setSelectedMaterialId(m.id)} className={`flex items-center p-4 rounded-2xl border-2 transition-all ${selectedMaterialId === m.id || (!selectedMaterialId && m.id === currentCategory.options.materials[0].id) ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-gray-50 bg-gray-50/50'}`}>
                <img src={m.sample} className="w-12 h-12 rounded-xl object-cover mr-4 border border-white" />
                <div className="flex-1 text-left">
                  <div className="flex justify-between font-black text-[14px] text-gray-800"><span>{m.name}</span>{m.priceOffset > 0 && <span className="text-orange-500">+¥{m.priceOffset}</span>}</div>
                  <p className="text-[9px] opacity-70 font-medium">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(currentCategory?.options.models || currentCategory?.options.sizes || []).map(opt => (
              <button key={opt} onClick={() => setSelectedSize(opt)} className={`px-5 py-2.5 text-xs rounded-2xl border-2 font-black transition-all ${selectedSize === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white border-gray-100 text-gray-400'}`}>{opt}</button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 mt-4">
           <button onClick={handleFinalPreview} disabled={isPreviewing} className="flex-1 py-5 bg-gray-50 text-indigo-600 rounded-[2rem] font-black text-sm flex items-center justify-center space-x-2 border-2 border-gray-100 active:scale-95 transition-all">
              <Eye className="w-4 h-4" /> <span>刷新场景效果</span>
           </button>
           <button onClick={() => handlePlaceOrder()} className="flex-[2] py-5 bg-black text-white rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 transition-all">确认无误 立即下单</button>
        </div>
      </div>
    </div>
  );

  const renderGalleryLayer = () => (
    <div className="flex flex-col h-full space-y-4 px-2">
      <div className="flex items-center space-x-8">
        <button onClick={() => setGalleryTab('public')} className={`text-xl font-black transition-all ${galleryTab === 'public' ? 'text-indigo-600 border-b-4 border-indigo-600 pb-1' : 'text-gray-300'}`}>优选库</button>
        <button onClick={() => setGalleryTab('personal')} className={`text-xl font-black transition-all ${galleryTab === 'personal' ? 'text-indigo-600 border-b-4 border-indigo-600 pb-1' : 'text-gray-300'}`}>我的画廊</button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-4 pb-24">
        {savedArtworks.length > 0 ? savedArtworks.map(art => (
          <div key={art.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-2">
            <img src={art.url} className="w-full aspect-square object-cover rounded-2xl mb-2" onClick={() => setZoomedImage(art.url)} />
            <p className="text-[9px] font-black line-clamp-1 italic text-gray-400">"{art.prompt}"</p>
          </div>
        )) : (
          <div className="col-span-2 text-center py-48 text-gray-200 font-black uppercase tracking-widest opacity-20 italic">No Designs Yet</div>
        )}
      </div>
    </div>
  );

  const renderTrackingLayer = () => (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between px-2 pt-4">
        <h2 className="text-3xl font-black text-gray-800 tracking-tighter">订单与追踪</h2>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase">Factory C2M Link</div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-32">
        {orders.length > 0 ? orders.map(order => (
          <div key={order.id} className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-gray-50 space-y-8">
             <div className="flex justify-between items-center">
               <div className="flex items-center space-x-5">
                 <img src={order.image} className="w-20 h-20 rounded-2xl object-cover shadow-xl border border-white" />
                 <div>
                   <div className="font-black text-lg text-gray-800">{order.productName}</div>
                   <div className="text-[9px] text-gray-300 font-bold">ID: {order.id}</div>
                 </div>
               </div>
               <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black">生产中</div>
             </div>
             <div className="relative px-3 py-2">
                <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 rounded-full"></div>
                <div className="relative flex justify-between">
                  {[CheckCircle2, Box, Truck, Package].map((Icon, idx) => (
                    <div key={idx} className={`p-2.5 rounded-2xl border-4 transition-all ${idx === 0 ? 'bg-indigo-600 text-white border-white' : 'bg-white text-gray-100 border-gray-50'}`}><Icon className="w-4 h-4" /></div>
                  ))}
                </div>
             </div>
          </div>
        )) : <div className="flex-1 flex flex-col items-center justify-center py-48 opacity-10 grayscale"><ClipboardList className="w-24 h-24 mb-4" /><p className="text-sm font-black uppercase tracking-widest">No Active Orders</p></div>}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-gray-50 pb-20 overflow-hidden font-sans">
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} className="max-w-full max-h-[92vh] object-contain rounded-[2rem] shadow-2xl" />
        </div>
      )}

      <header className="px-6 py-5 flex items-center justify-between bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100/50 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-indigo-600 uppercase leading-none tracking-tighter">AIGC C2M</h1>
          <div className="flex space-x-3 mt-2.5">
            <div className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-xl flex items-center border border-indigo-100 shadow-sm">
              <Coins className="w-3.5 h-3.5 mr-1.5" /><span className="text-[11px] font-black">{user.points}</span>
            </div>
            <div className="px-2.5 py-1 bg-green-50 text-green-600 rounded-xl flex items-center border border-green-100 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /><span className="text-[11px] font-black">已加密</span>
            </div>
          </div>
        </div>
        {!user.isLoggedIn ? (
          <button onClick={() => setShowLogin(true)} className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-2xl shadow-xl active:scale-95 transition-all">登录/创作</button>
        ) : (
          <div className="w-12 h-12 rounded-[1.2rem] border-4 border-white shadow-xl overflow-hidden bg-gray-100 ring-1 ring-gray-100"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" /></div>
        )}
      </header>

      <main className="flex-1 p-4 overflow-hidden relative">
        {activeLayer === AppLayer.DESIGN && renderDesignLayer()}
        {activeLayer === AppLayer.PRODUCT && renderProductLayer()}
        {activeLayer === AppLayer.GALLERY && renderGalleryLayer()}
        {activeLayer === AppLayer.TRACKING && renderTrackingLayer()}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] glass-morphism rounded-[3rem] p-2 flex items-center justify-around shadow-2xl z-50 border border-white/40 ring-1 ring-black/5">
        <button onClick={() => setActiveLayer(AppLayer.DESIGN)} className={`p-4 rounded-[2rem] transition-all duration-300 ${activeLayer === AppLayer.DESIGN ? 'bg-indigo-600 text-white shadow-2xl scale-110 -translate-y-3' : 'text-gray-300'}`}><Sparkles className="w-6 h-6" /></button>
        <button onClick={() => setActiveLayer(AppLayer.PRODUCT)} disabled={!design.artworkUrl} className={`p-4 rounded-[2rem] transition-all duration-300 ${activeLayer === AppLayer.PRODUCT ? 'bg-indigo-600 text-white shadow-2xl scale-110 -translate-y-3' : 'text-gray-300'} disabled:opacity-10`}><Layout className="w-6 h-6" /></button>
        <button onClick={() => setActiveLayer(AppLayer.GALLERY)} className={`p-4 rounded-[2rem] transition-all duration-300 ${activeLayer === AppLayer.GALLERY ? 'bg-indigo-600 text-white shadow-2xl scale-110 -translate-y-3' : 'text-gray-300'}`}><ImageIcon className="w-6 h-6" /></button>
        <button onClick={() => setActiveLayer(AppLayer.TRACKING)} className={`p-4 rounded-[2rem] transition-all duration-300 ${activeLayer === AppLayer.TRACKING ? 'bg-indigo-600 text-white shadow-2xl scale-110 -translate-y-3' : 'text-gray-300'}`}><Package className="w-6 h-6" /></button>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
      </nav>

      {showLogin && (
        <div className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-sm space-y-10 shadow-2xl">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight text-center">AI 创作实验室</h2>
            <input type="tel" placeholder="请输入手机号" className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] outline-none text-center font-black text-xl shadow-inner" value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value})} />
            <button onClick={handleLogin} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all">确认开启</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
