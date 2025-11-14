import moment from "moment";
import { customAlphabet } from "nanoid/non-secure";

export function formatCurrency(amount: number, dec: number = 0) {
	return "₦" + Number(amount)
		.toFixed(dec)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
}

export function formatShortCurrency(amount: number): string {
	if (amount >= 1_000_000) {
		return `₦${(amount / 1_000_000).toFixed(1)}M`;
	}
	if (amount >= 1_000) {
		return `₦${(amount / 1_000).toFixed(0)}k`;
	}
	return `₦${amount}`;
}

export function formatNumber(amount: number) {
	return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
}

export function generateSlug(num=10) {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', num);
  return nanoid();
};

export function calculatePercentage(current: number, target: number): number {
	if (target === 0) return 0;
	const percentage = (current / target) * 100;
	return percentage >= 100 ? 100 : Number(percentage.toFixed(percentage % 1 === 0 ? 0 : 1));
}

export function formatDate(dateString: string): string {
	const momentDate = moment(dateString);
	const now = moment();
	
	const minutesAgo = now.diff(momentDate, 'minutes');
	const hoursAgo = now.diff(momentDate, 'hours');
	const daysAgo = now.diff(momentDate, 'days');
	const weeksAgo = now.diff(momentDate, 'weeks');
	const monthsAgo = now.diff(momentDate, 'months');
	const yearsAgo = now.diff(momentDate, 'years');

	if (minutesAgo < 1) {
		return 'Just now';
	} else if (minutesAgo < 60) {
		return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
	} else if (hoursAgo < 24) {
		return `${hoursAgo} hr${hoursAgo > 1 ? 's' : ''} ago`;
	} else if (daysAgo === 1) {
		return 'Yesterday';
	} else if (daysAgo < 7) {
		return `Last ${momentDate.format('ddd')}`; // Last Tue
	} else if (weeksAgo < 4) {
		return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
	} else if (monthsAgo < 12) {
		return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
	} else {
		return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
	}
}