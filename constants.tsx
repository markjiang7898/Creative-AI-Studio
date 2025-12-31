
import React from 'react';
import { Category } from './types';
import { MousePointer2, Smartphone, Bed, Shirt } from 'lucide-react';

export const DESIGN_STYLES = [
  { id: 'cyberpunk', name: '赛博', prompt: 'High-end cyberpunk streetwear aesthetic, glitch distortion, vivid neon cyan and magenta accents, futuristic tech-wear patterns' },
  { id: 'minimalist', name: '极简', prompt: 'International Typographic Style, sophisticated Bauhaus geometric composition, premium negative space, elite brand identity feel' },
  { id: 'watercolor', name: '水彩', prompt: 'Contemporary fine art watercolor, ethereal fluid layers, organic artistic bleeding effects, high-gallery quality illustration' },
  { id: 'oil', name: '油画', prompt: 'Modern expressionist oil painting, rich impasto brushwork, dramatic chiaroscuro lighting, textured canvas aesthetic' },
  { id: 'cute', name: '萌系', prompt: 'Sophisticated pop-art character design, high-end toy aesthetic, vibrant flat color blocking, professional vector charm' },
  { id: '3d', name: '3D渲', prompt: 'Hyper-realistic 3D abstract sculpture, iridescent liquid metal, glass refraction, Octane Render 5 quality, luxury texture' }
];

export const CATEGORIES = [
  { 
    id: Category.MOUSEPAD, 
    name: '鼠标垫', 
    icon: <MousePointer2 className="w-4 h-4" />,
    aspectRatio: '16:9',
    basePrice: 49,
    options: {
      materials: [
        { id: 'rubber', name: '天然橡胶', desc: '4mm加厚 / 防滑底纹', priceOffset: 0, timeOffset: 0, sample: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=100&h=100&fit=crop' },
        { id: 'leather', name: '双面皮质', desc: '防水耐污 / 商务质感', priceOffset: 30, timeOffset: 1, sample: 'https://images.unsplash.com/photo-1524292332709-b33366a7f139?w=100&h=100&fit=crop' }
      ],
      sizes: ['200x250mm', '300x800mm', '400x900mm']
    }
  },
  { 
    id: Category.PHONECASE, 
    name: '手机壳', 
    icon: <Smartphone className="w-4 h-4" />,
    aspectRatio: '9:16',
    basePrice: 69,
    options: {
      materials: [
        { id: 'silicone', name: '液态硅胶', desc: '1.8mm / 亲肤防摔', priceOffset: 0, timeOffset: 0, sample: 'https://images.unsplash.com/photo-1610731071020-fa83405781ee?w=100&h=100&fit=crop' },
        { id: 'glass', name: '钢化玻璃', desc: '2.5mm / 高透防刮', priceOffset: 20, timeOffset: 1, sample: 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?w=100&h=100&fit=crop' }
      ],
      models: ['iPhone 15 Pro', 'Mate 60 Pro', 'Xiaomi 14']
    }
  },
  { 
    id: Category.BEDDING, 
    name: '床品', 
    icon: <Bed className="w-4 h-4" />,
    aspectRatio: '1:1',
    basePrice: 399,
    options: {
      materials: [
        { id: 'cotton', name: '长绒棉', desc: '60支高密 / 亲肤透气', priceOffset: 0, timeOffset: 0, sample: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=100&h=100&fit=crop' },
        { id: 'silk', name: '真丝', desc: '19姆米桑蚕丝 / 奢华', priceOffset: 600, timeOffset: 5, sample: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=100&h=100&fit=crop' }
      ],
      sizes: ['1.5m 床', '1.8m 床', '2.0m 床']
    }
  },
  { 
    id: Category.TSHIRT, 
    name: '个性T恤', 
    icon: <Shirt className="w-4 h-4" />,
    aspectRatio: '3:4',
    basePrice: 129,
    options: {
      materials: [
        { id: 'cotton_heavy', name: '重磅纯棉', desc: '260g / 挺括有型 / 不透', priceOffset: 0, timeOffset: 0, sample: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' },
        { id: 'functional', name: '凉感速干', desc: '科技面料 / 排汗透气', priceOffset: 20, timeOffset: 2, sample: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100&h=100&fit=crop' }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Oversized'],
      colors: [
        { id: 'white', name: '云雾白', value: '#FFFFFF' },
        { id: 'black', name: '暗夜黑', value: '#1A1A1A' },
        { id: 'grey', name: '水泥灰', value: '#9E9E9E' }
      ]
    }
  }
];
