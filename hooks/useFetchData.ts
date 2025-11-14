import { firestore } from "@/config/firebase";
import { collection, onSnapshot, query, QueryConstraint } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function useFetchData<T>(collectionName: string, constrains: QueryConstraint[] = []) {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refetchTrigger, setRefetchTrigger] = useState(0); // helps us while refetching...

	useEffect(function () {
		if (!collectionName) return;
		setLoading(true);
		const collectionRef = collection(firestore, collectionName);
		const q = query(collectionRef, ...constrains);

		const unsub = onSnapshot(
			q,
			(snapshot) => {
				const fetchedData = snapshot.docs.map((doc) => {
					return {
						id: doc.id,
						...doc.data(),
					};
				}) as T[];
				setData(fetchedData);
				// setLoading(false);

				// temp
				if(refetchTrigger) {
					setTimeout(() => setLoading(false), 200);
				} else {
					setLoading(false);
				}
			},
			(err: any) => {
				console.log("Error fetching data: ", err);
				if (err.code === 'unavailable') {
					setError('No internet connection. Please check your network.');
				} else if (err.code === 'permission-denied') {
					setError('Access denied. Please login.');
				} else {
					setError(err.message || "Oops Error!");
				}
				setLoading(false);
			},
		);

		return () => unsub();
	}, [refetchTrigger]);

	const refetch = () => setRefetchTrigger(prev => prev + 1);

	return { data, loading, error, refetch };
}
