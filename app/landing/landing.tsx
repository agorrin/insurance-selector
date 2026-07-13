import { useState } from "react";
import { useNavigate } from "react-router";
import Select, { type MultiValue } from "react-select";

const states = [
	{ label: "Indiana", value: "IN" },
	{ label: "Illinois", value: "IL" },
	{ label: "Michigan", value: "MI" },
] as const;
const insuranceTypes = [
	{ label: "Auto", value: "Auto" },
	{ label: "Fire", value: "Fire" },
	{ label: "Flood", value: "Flood" },
] as const;

type InsuranceTypeOption = {
	label: string;
	value: string;
};

export default function Landing() {
	const navigate = useNavigate();
	const [selectedState, setSelectedState] = useState<string>("");
	const [selectedInsuranceTypes, setSelectedInsuranceTypes] = useState<
		InsuranceTypeOption[]
	>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!selectedState || selectedInsuranceTypes.length === 0) {
			setErrorMessage("Please select both a state and at least one insurance type.");
			return;
		}

		setIsLoading(true);
		setErrorMessage("");

		const insuranceTypeParams = selectedInsuranceTypes
			.map((insuranceType) => encodeURIComponent(insuranceType.value))
			.join(",");

		navigate(
			`/results?state=${encodeURIComponent(selectedState)}&insuranceTypes=${insuranceTypeParams}`,
		);
	};

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_42%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
				<section className="max-w-2xl">
					<div className="inline-flex rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm backdrop-blur">
						Modern insurance discovery
					</div>
					<h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					</h1>
					<p className="mt-4 text-lg leading-8 text-slate-600">
						Find trusted carrier options in seconds with a polished experience built for fast, confident decisions.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						{["Fast matching", "Trusted carriers", "Clear insights"].map((item) => (
							<div
								key={item}
								className="rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
							>
								{item}
							</div>
						))}
					</div>
				</section>

				<form
					onSubmit={handleSubmit}
					className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8"
				>
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
								Insurance selector
							</p>
							<h2 className="mt-1 text-2xl font-semibold text-slate-900">
								Find your next carrier
							</h2>
						</div>
						<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
							3 states
						</div>
					</div>

					<label
						htmlFor="state-select"
						className="mt-6 block text-sm font-medium text-slate-700"
					>
						State
					</label>
					<select
						id="state-select"
						value={selectedState}
						onChange={(event) => setSelectedState(event.target.value)}
						className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
						className="mt-5 block text-sm font-medium text-slate-700"
					>
						Insurance Type
					</label>
					<Select
						inputId="insurance-type-select"
						isMulti
						options={insuranceTypes}
						value={selectedInsuranceTypes}
						onChange={(newValue: MultiValue<InsuranceTypeOption>) =>
							setSelectedInsuranceTypes([...newValue])
						}
						placeholder="Select insurance type(s)"
						className="mt-2"
						classNamePrefix="insurance-type-select"
						styles={{
							control: (base) => ({
								...base,
								borderColor: "#d1d5db",
								boxShadow: "none",
								"&:hover": {
									borderColor: "#9ca3af",
								},
							}),
							multiValue: (base) => ({
								...base,
								backgroundColor: "#dbeafe",
								color: "#111827",
							}),
							multiValueLabel: (base) => ({
								...base,
								color: "#111827",
							}),
							multiValueRemove: (base) => ({
								...base,
								color: "#374151",
								":hover": {
									backgroundColor: "#bfdbfe",
									color: "#111827",
								},
							}),
							option: (base, state) => ({
								...base,
								backgroundColor: state.isSelected
									? "#2563eb"
									: state.isFocused
										? "#f3f4f6"
										: "#ffffff",
								color: state.isSelected ? "#ffffff" : "#111827",
								cursor: "pointer",
							}),
						}}
					/>

					<button
						type="submit"
						className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
						disabled={isLoading}
					>
						{isLoading ? "Preparing..." : "Find carriers"}
					</button>

					{errorMessage ? (
						<p className="mt-3 text-sm text-red-600">{errorMessage}</p>
					) : null}
				</form>
			</div>
		</main>
	);
}
