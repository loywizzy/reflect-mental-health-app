import Link from 'next/link';
import { Leaf, Phone, Globe, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CrisisPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex flex-col">
            {/* Header */}
            <header className="w-full py-4 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center gap-2">
                        <Leaf className="h-6 w-6 text-sage-600" />
                        <span className="text-lg font-semibold text-sage-800">Reflect</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    {/* Heart Icon */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 animate-pulse-soft">
                            <Heart className="h-10 w-10 text-green-600" fill="#22c55e" />
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                        เราเข้าใจว่าบางครั้งมันยากลำบาก
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        คุณไม่ได้อยู่คนเดียว
                    </p>

                    {/* Help Resources */}
                    <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-6 mb-8 text-left">
                        <div className="space-y-6">
                            {/* Hotline */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        สายด่วนสุขภาพจิต
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">1323</p>
                                    <p className="text-sm text-gray-500">ให้บริการ 24 ชั่วโมง</p>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Globe className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">กรมสุขภาพจิต</p>
                                    <a
                                        href="https://www.dmh.go.th"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        www.dmh.go.th
                                    </a>
                                </div>
                            </div>

                            {/* Personal Support */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Heart className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        หรือติดต่อคนที่คุณไว้วางใจ
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ครอบครัว เพื่อน หรือคนใกล้ชิด
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <Link href="/">
                        <Button variant="secondary" size="lg">
                            <ArrowLeft className="h-4 w-4" />
                            กลับหน้าหลัก
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer Note */}
            <footer className="py-6 px-4 text-center">
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    หน้านี้แสดงเมื่อระบบตรวจพบคำที่อาจบ่งบอกถึงความต้องการความช่วยเหลือ
                    <br />
                    AI ไม่สามารถให้คำปรึกษาในสถานการณ์นี้ได้
                </p>
            </footer>
        </div>
    );
}
