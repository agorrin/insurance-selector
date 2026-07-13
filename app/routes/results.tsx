import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type CarrierResult = {
	name: string;
	phone: string;
	website: string;
};

function formatCarrierName(name: string) {
	return name.replace(/\s+/g, " ").trim();
}

export default function ResultsPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const [carriers, setCarriers] = useState<CarrierResult[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const state = params.get("state") ?? "";
		const insuranceTypes = params.get("insuranceTypes") ?? "";

		if (!state || !insuranceTypes) {
			navigate("/", { replace: true });
			return;
		}

		const loadResults = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const response = await fetch(
					`/api/carriers?state=${encodeURIComponent(state)}&insuranceTypes=${insuranceTypes}`,
				);
				const data = (await response.json()) as {
					carriers?: string[];
					message?: string;
				};

				if (!response.ok) {
					setErrorMessage(data.message ?? "Unable to load carriers.");
					setCarriers([]);
					return;
				}

				const fallbackCarriers = (data.carriers ?? []).map((carrierName) => ({
					name: formatCarrierName(carrierName),
					phone: "(800) 555-0199",
					website: "https://example.com",
				}));

				setCarriers(fallbackCarriers);
			} catch {
				setErrorMessage("Unable to load carriers.");
				setCarriers([]);
			} finally {
				setIsLoading(false);
			}
		};

		void loadResults();
	}, [location.search, navigate]);

	return (
		<main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
							Carrier results
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-slate-900">
							Your matched carriers
						</h1>
						<p className="mt-2 text-slate-600">
							Explore each option in a polished, card-based layout designed for quick review.
						</p>
					</div>
					<button
						type="button"
						onClick={() => navigate("/")}
						className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
					>
						Back to search
					</button>
				</div>

			{isLoading ? (
				<div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
					Loading carriers...
				</div>
			) : errorMessage ? (
				<div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
					{errorMessage}
				</div>
			) : carriers.length === 0 ? (
				<div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
					No carriers matched your search.
				</div>
			) : (
				<div className="space-y-4">
					{carriers.map((carrier) => (
						<article
							key={carrier.name}
							className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center md:justify-between"
						>
							<div>
								<h2 className="text-xl font-semibold text-slate-900">{carrier.name}</h2>
								<p className="mt-2 text-sm text-slate-600">Trusted coverage options with responsive support.</p>
							</div>
							<div className="flex flex-col gap-3 text-sm text-slate-700 md:items-end">
								<a href={`tel:${carrier.phone}`} className="font-medium text-blue-600 hover:text-blue-700">
									{carrier.phone}
								</a>
								<a
									href={carrier.website}
									target="_blank"
									rel="noreferrer"
									className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-blue-600"
								>
									Visit website
								</a>
							</div>
						</article>
					))}
				</div>
			)}
			</div>
		</main>
	);
}
