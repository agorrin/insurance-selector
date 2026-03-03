import { useState } from "react";

const states = [
	{ label: "Indiana", value: "IN" },
	{ label: "Illinois", value: "IL" },
	{ label: "Michigan", value: "MI" },
] as const;
const insuranceTypes = ["Auto", "Fire", "Flood"] as const;

export default function Landing() {
	const [selectedState, setSelectedState] = useState<string>("");
	const [selectedInsuranceType, setSelectedInsuranceType] = useState<string>("");
	const [carriers, setCarriers] = useState<string[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasSearched, setHasSearched] = useState<boolean>(false);

	const handleSubmit = async () => {
		if (!selectedState || !selectedInsuranceType) {
			setErrorMessage("Please select both a state and insurance type.");
			setCarriers([]);
			return;
		}

		setIsLoading(true);
		setErrorMessage("");
		setHasSearched(false);

		try {
			const response = await fetch(
				`/api/carriers?state=${encodeURIComponent(selectedState)}&insuranceType=${encodeURIComponent(selectedInsuranceType)}`,
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

			setCarriers(data.carriers ?? []);
			setHasSearched(true);
		} catch {
			setErrorMessage("Unable to load carriers.");
			setCarriers([]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="flex items-center justify-center min-h-screen px-4">
			<section className="w-full max-w-md rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
					Choose Your State
				</h1>
				<label
					htmlFor="state-select"
					className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					State
				</label>
				<select
					id="state-select"
					value={selectedState}
					onChange={(event) => setSelectedState(event.target.value)}
					className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
				>
					<option value="" disabled>
						Select a state
					</option>
					{states.map((state) => (
						<option key={state.value} value={state.value}>
							{state.label}
						</option>
					))}
				</select>

				<label
					htmlFor="insurance-type-select"
					className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Insurance Type
				</label>
				<select
					id="insurance-type-select"
					value={selectedInsuranceType}
					onChange={(event) => setSelectedInsuranceType(event.target.value)}
					className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
				>
					<option value="" disabled>
						Select an insurance type
					</option>
					{insuranceTypes.map((insuranceType) => (
						<option key={insuranceType} value={insuranceType}>
							{insuranceType}
						</option>
					))}
				</select>
                <div className="mt-4">
                    <button
						className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
						onClick={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? "Loading..." : "Submit"}
					</button>
                </div>
				{errorMessage ? (
					<p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
				) : null}
				<div className="mt-4">
					<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Carriers</p>
					{carriers.length > 0 ? (
						<ul className="mt-2 list-disc pl-5 text-sm text-gray-800 dark:text-gray-200">
							{carriers.map((carrier) => (
								<li key={carrier}>{carrier}</li>
							))}
						</ul>
					) : hasSearched && !errorMessage && !isLoading ? (
						<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
							No matching carriers found.
						</p>
					) : null}
				</div>
			</section>
		</main>
	);
}
