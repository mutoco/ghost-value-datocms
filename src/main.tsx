import { connect } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import ConfigScreen from "./entrypoints/ConfigScreen";
import { render } from "./utils/render";

function getByPath(obj: any, path: string) {
	if (!obj || !path) return undefined;
	return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function coerceLocalizedValue(value: unknown, locale: string): string {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") {
		const v = (value as Record<string, unknown>)[locale];
		return typeof v === "string" ? v : "";
	}
	return "";
}

function GhostValueFieldExtension({ ctx }: { ctx: any }) {
	const sourceApiKey = (ctx.parameters?.sourceFieldApiKey as string | undefined) || "";
	const rawCurrentValue = getByPath(ctx.formValues, ctx.fieldPath);
	const currentValue = coerceLocalizedValue(rawCurrentValue, ctx.locale);

	const rawPlaceholderValue = sourceApiKey ? getByPath(ctx.formValues, sourceApiKey) : "";
	const placeholderValue = coerceLocalizedValue(rawPlaceholderValue, ctx.locale);

	return (
		<div className="form__field">
			<input
				type="text"
				value={currentValue}
				placeholder={placeholderValue}
				disabled={ctx.disabled}
				onChange={(e) => ctx.setFieldValue(ctx.fieldPath, e.target.value)}
				style={{
					width: "100%",
					padding: "10px",
					border: "1px solid #e0e0e0",
					boxSizing: "border-box",
				}}
			/>
		</div>
	);
}

function GhostValueConfigScreen({ ctx }: { ctx: any }) {
	const sourceFieldApiKey = (ctx.parameters?.sourceFieldApiKey as string | undefined) || "";
	const error = ctx.errors?.sourceFieldApiKey as string | undefined;

	return (
		<div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
			<h2 style={{ margin: "0 0 8px 0" }}>Ghost Value</h2>
			<p style={{ margin: "0 0 16px 0", color: "#555" }}>
				Set the API key of the Single-line String field whose value should be used as the placeholder.
			</p>

			<label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
				Source field API key
			</label>

			<input
				type="text"
				value={sourceFieldApiKey}
				onChange={(e) => ctx.setParameters({ sourceFieldApiKey: e.target.value })}
				placeholder="e.g. title"
				style={{
					width: "100%",
					padding: "8px",
					border: error ? "1px solid #d92d20" : "1px solid #e0e0e0",
					borderRadius: "6px",
					boxSizing: "border-box",
				}}
			/>

			{error ? (
				<p style={{ marginTop: 8, color: "#d92d20", fontSize: 12 }}>{error}</p>
			) : (
				<p style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
					This must be a field API key on the same model (same record).
				</p>
			)}
		</div>
	);
}

connect({
	renderConfigScreen(ctx) {
		return render(<ConfigScreen ctx={ctx} />);
	},

	manualFieldExtensions() {
		return [
			{
				id: "ghost-value",
				name: "Ghost Value",
				type: "editor",
				fieldTypes: ["string"],
				configurable: { initialHeight: 220 },
				initialHeight: 60,
			},
		];
	},

	renderManualFieldExtensionConfigScreen(fieldExtensionId, ctx) {
		if (fieldExtensionId !== "ghost-value") return;
		return render(<GhostValueConfigScreen ctx={ctx} />);
	},

	validateManualFieldExtensionParameters(fieldExtensionId, parameters) {
		if (fieldExtensionId !== "ghost-value") return {};

		const sourceFieldApiKey = parameters?.sourceFieldApiKey;

		if (!sourceFieldApiKey || typeof sourceFieldApiKey !== "string" || !sourceFieldApiKey.trim()) {
			return { sourceFieldApiKey: "Please provide a source field API key." };
		}

		// Basic safety check: API keys are usually snake_case
		if (!/^[a-z0-9_]+$/.test(sourceFieldApiKey)) {
			return { sourceFieldApiKey: "This does not look like a valid field API key (expected lowercase letters, numbers, underscores)." };
		}

		return {};
	},

	renderFieldExtension(fieldExtensionId, ctx) {
		if (fieldExtensionId !== "ghost-value") return;
		return render(<GhostValueFieldExtension ctx={ctx} />);
	},
});
