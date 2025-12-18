import { calculateTimeLeft } from "@/utils/helpers";
import { useEffect, useState } from "react";

export function useCountdown(targetTime: string) {
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetTime));

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTimeLeft(calculateTimeLeft(targetTime));
		}, 1000);

		return () => clearInterval(intervalId);
	}, [targetTime]);

	return timeLeft;
}
