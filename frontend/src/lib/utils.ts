import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatRelativeDate(dateString: string): string {
    // Parse วันที่ในรูป "YYYY-MM-DD" หรือ ISO string
    // แปลงเป็น local midnight เพื่อหลีกเลี่ยง UTC offset bug
    const parts = dateString.split('T')[0].split('-');
    const entryDate = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
    );
    entryDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - entryDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return 'เมื่อวาน';
    if (diffDays < 0) return 'วันนี้'; // future date safety
    if (diffDays < 7) return `${diffDays} วันก่อน`;
    return formatDate(dateString);
}

export function getEmotionEmoji(emotion: string): string {
    const emojiMap: Record<string, string> = {
        calm: '😌',
        tense: '😰',
        sad: '😔',
        happy: '😊',
        neutral: '😐',
    };
    return emojiMap[emotion] || '😐';
}

export function getEmotionColor(emotion: string): string {
    const colorMap: Record<string, string> = {
        calm: 'text-green-600',
        tense: 'text-orange-500',
        sad: 'text-blue-500',
        happy: 'text-yellow-500',
        neutral: 'text-gray-500',
    };
    return colorMap[emotion] || 'text-gray-500';
}

export function getSentimentColor(sentiment: number): string {
    if (sentiment >= 0.3) return 'text-green-600';
    if (sentiment <= -0.3) return 'text-red-500';
    return 'text-gray-500';
}
