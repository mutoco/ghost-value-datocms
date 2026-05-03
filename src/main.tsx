import { connect } from "datocms-plugin-sdk";
import type { ChangeEvent, CSSProperties } from "react";
import "datocms-react-ui/styles.css";
import ConfigScreen from "./entrypoints/ConfigScreen";
import { render } from "./utils/render";
import styles from "./styles.module.css";

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

function isMultiParagraphField(ctx: any): boolean {
	const fieldType =
		ctx?.field?.attributes?.field_type ||
		ctx?.field?.attributes?.fieldType ||
		ctx?.field?.field_type ||
		ctx?.field?.fieldType;

	return fieldType === "text";
}

function GhostValueFieldExtension({ ctx }: { ctx: any }) {
	const sourceApiKey = (ctx.parameters?.sourceFieldApiKey as string | undefined) || "";
	const rawCurrentValue = getByPath(ctx.formValues, ctx.fieldPath);
	const currentValue = coerceLocalizedValue(rawCurrentValue, ctx.locale);

	const rawPlaceholderValue = sourceApiKey ? getByPath(ctx.formValues, sourceApiKey) : "";
	const placeholderValue = coerceLocalizedValue(rawPlaceholderValue, ctx.locale);
	const renderAsTextarea = isMultiParagraphField(ctx);

	const sharedInputProps = {
		value: currentValue,
		placeholder: placeholderValue,
		disabled: ctx.disabled,
		onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			ctx.setFieldValue(ctx.fieldPath, e.target.value),
		style: {
			"--input-border": "#0000000d",
			"--input-border-hover": "#c7c7c7",
			"--input-border-focus": "#282828",
		} as CSSProperties,
	};

	return (
		<div className="form__field" style={{ padding: 10 }}>
			{renderAsTextarea ? (
				<textarea {...sharedInputProps} className={`${styles.input} ${styles.textarea}`} />
			) : (
				<input {...sharedInputProps} type="text" className={styles.input} />
			)}
		</div>
	);
}

function GhostValueConfigScreen({ ctx }: { ctx: any }) {
	const sourceFieldApiKey = (ctx.parameters?.sourceFieldApiKey as string | undefined) || "";
	const error = ctx.errors?.sourceFieldApiKey as string | undefined;

	return (
		<div style={{ padding: 10, fontFamily: "colfax-web, Roboto, \"Helvetica Neue\", Helvetica, Roboto, Arial, sans-serif" }}>
			<label style={{ display: "block", fontWeight: 400, fontSize: 13.5, marginBottom: 6.4, color: "#3a3436" }}>
				Source field ID
			</label>

			<input
				type="text"
				value={sourceFieldApiKey}
				onChange={(e) => ctx.setParameters({ sourceFieldApiKey: e.target.value })}
				placeholder="navigation_title"
				className={styles.input}
				style={
					{
						"--input-border": error ? "#d92d20" : "#f0f0f0",
						"--input-border-hover": error ? "#d92d20" : "#c7c7c7",
						"--input-border-focus": error ? "#d92d20" : "#282828",
					} as CSSProperties
				}
			/>

			{error ? (
				<p style={{ marginTop: 8, color: "#d92d20", fontSize: 12 }}>{error}</p>
			) : (
				<p style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
					This must be a field ID on the same record
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
				fieldTypes: ["string", "text"],
				configurable: { initialHeight: 64 },
				initialHeight: 64,
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
			return { sourceFieldApiKey: "Please provide a source field ID." };
		}

		// Basic safety check: API keys are usually snake_case
		if (!/^[a-z0-9_]+$/.test(sourceFieldApiKey)) {
			return { sourceFieldApiKey: "This does not look like a valid field ID (expected lowercase letters, numbers, underscores)." };
		}

		return {};
	},

	renderFieldExtension(fieldExtensionId, ctx) {
		if (fieldExtensionId !== "ghost-value") return;
		return render(<GhostValueFieldExtension ctx={ctx} />);
	},
});
