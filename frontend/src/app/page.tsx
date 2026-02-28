'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, BookOpen, BarChart3, MessageCircleHeart, Shield, Users, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleStart = () => {
    if (isLoggedIn) {
      router.push('/journal');
    } else {
      setShowAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-sage-100">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-sage-600" />
            <span className="text-xl font-semibold text-sage-800">Reflect</span>
          </div>
          {isLoggedIn ? (
            <Button variant="primary" size="sm" onClick={() => router.push('/journal')}>
              📝 เข้าเขียน Journal
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setShowAuth(true)}>
              เข้าสู่ระบบ
            </Button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          isLogin={isLogin}
          onToggle={() => setIsLogin(!isLogin)}
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); router.push('/journal'); }}
        />
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-2 text-sm text-sage-700">
            <Leaf className="h-4 w-4" />
            <span>พื้นที่ปลอดภัยสำหรับใจคุณ</span>
          </div>

          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
            สำรวจความคิด เข้าใจความรู้สึก
            <br />
            <span className="text-sage-600">ค้นพบตัวเอง ในเวอร์ชันที่ชัดเจนขึ้น</span>
          </h1>

          <p className="mb-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Reflect คือสมุดบันทึกรับฟังประจำวัน ที่ช่วยให้คุณตกตะกอนอารมณ์และเรื่องราวผ่านการเขียน
            เปลี่ยนทุกการระบาย ให้กลายเป็นการพักใจและเติบโตอย่างมีความสุข
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={handleStart}>
              🚀 เริ่มต้นใช้งาน
            </Button>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                ดูฟีเจอร์
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ✨ ฟีเจอร์หลัก
            </h2>
            <p className="text-gray-600">
              ออกแบบมาเพื่อความปลอดภัยและการเข้าใจตัวเอง
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="อิสระแห่งการบันทึก"
              description="พิมพ์เล่าเรื่องได้ตามใจ ไม่มีคำถามบังคับ เป็นพื้นที่ส่วนตัวที่ปลอดภัย 100%"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="สังเกตผ่านภาษา"
              description="รับรู้ระดับความกดดันที่ซ่อนอยู่ จากวิธีที่คุณเรียบเรียงประโยคและเลือกใช้คำ"
            />
            <FeatureCard
              icon={<MessageCircleHeart className="h-6 w-6" />}
              title="เพื่อนชวนคิด"
              description="AI รับฟังและตั้งคำถามปลายเปิดอย่างตั้งใจ เพื่อช่วยให้คุณค้นพบคำตอบด้วยตัวเอง"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="แนวโน้มความรู้สึก"
              description="สรุปภาพรวมอารมณ์ของคุณในแต่ละสัปดาห์ โดยอ้างอิงจากมาตรฐานของคุณเอง ไม่เปรียบเทียบกับใคร"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="ค้นหาสิ่งกระตุ้นใจ"
              description="ช่วยตระหนักรู้ว่า หัวข้อไหน หรือเรื่องอะไร ที่มักจะส่งผลต่ออารมณ์ของคุณเป็นพิเศษ"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="ปลอดภัยและเป็นส่วนตัว"
              description="ข้อมูลทั้งหมดคือความลับของคุณ คุณมีสิทธิ์ควบคุมและลบทุกข้อความได้เสมอ"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-sage-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🎯 ทำงานอย่างไร
            </h2>
          </div>

          <div className="space-y-8">
            <StepCard step={1} title="เขียนหรือระบาย" description="พิมพ์บันทึกสิ่งที่เจอ หรืออารมณ์ในแต่ละวัน สั้นยาวแค่ไหนก็ได้ตามที่คุณต้องการ" />
            <StepCard step={2} title="AI รับฟังและสังเกต" description="ระบบช่วยอ่านข้อความของคุณ และรับรู้แนวโน้มอารมณ์อย่างเข้าใจ โดยไม่ตัดสิน" />
            <StepCard step={3} title="เห็นมุมมองใหม่" description="ค้นพบแบบแผนอารมณ์ของคุณ พร้อมรับคำถามดีๆ ที่ช่วยให้คุณเข้าใจตัวเองมากขึ้น" />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4 bg-warm-50 border-t border-warm-200">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-sm text-gray-600 leading-relaxed">
            🌿 <strong>Reflect เป็นเพียงพื้นที่รับฟังและสะท้อนความรู้สึก</strong> <br className="md:hidden" />
            (ไม่ใช่เครื่องมือทางการแพทย์ หรือใช้แทนจิตแพทย์/นักจิตวิทยา)
            <br />
            หากคุณรู้สึกหนักใจและต้องการความช่วยเหลือเร่งด่วน <br className="md:hidden" />
            สามารถโทรพูดคุยกับผู้เชี่ยวชาญได้ที่
            <strong className="text-sage-700"> สายด่วนสุขภาพจิต 1323</strong>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-sage-100">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="h-5 w-5 text-sage-500" />
            <span className="font-medium text-sage-700">Reflect</span>
          </div>
          <p>For educational / research / prototype use.</p>
        </div>
      </footer>
    </div>
  );
}


// ============================================================
// AUTH MODAL
// ============================================================

function AuthModal({
  isLogin,
  onToggle,
  onClose,
  onSuccess,
}: {
  isLogin: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Register validation
        if (password.length < 8) {
          setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('รหัสผ่านไม่ตรงกัน');
          setIsLoading(false);
          return;
        }
        await register(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-sage-600" />
            <h2 className="text-xl font-bold text-gray-800">
              {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50
                         focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
                         text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? '••••••••' : 'อย่างน้อย 8 ตัวอักษร'}
              required
              className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50
                         focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
                         text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                required
                className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50
                           focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
                           text-gray-700 placeholder-gray-400 transition-all"
              />
            </div>
          )}
          <Button type="submit" className="w-full justify-center" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? (
            <p>
              ยังไม่มีบัญชี?{' '}
              <button onClick={onToggle} className="font-semibold text-sage-700 hover:underline">
                สมัครสมาชิก
              </button>
            </p>
          ) : (
            <p>
              มีบัญชีแล้ว?{' '}
              <button onClick={onToggle} className="font-semibold text-sage-700 hover:underline">
                เข้าสู่ระบบ
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FEATURE / STEP CARDS
// ============================================================

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white p-6 shadow-sm card-hover">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sage-100 text-sage-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage-600 text-white flex items-center justify-center font-bold">
        {step}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
