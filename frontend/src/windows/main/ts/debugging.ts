import { filesystem, os } from "@neutralinojs/lib";
import path from "path-browserify";
import { dataPath } from "./settings";
import { pathExists } from "./utils";

function formatConsoleLog(...args: any[]): string {
	return args
		.map((arg) => {
			if (arg === null) {
				return "null";
			} else if (arg === undefined) {
				return "undefined";
			} else if (typeof arg === "string") {
				return arg;
			} else if (typeof arg === "number") {
				return arg.toString();
			} else if (typeof arg === "boolean") {
				return arg.toString();
			} else if (Array.isArray(arg)) {
				return JSON.stringify(arg);
			} else if (typeof arg === "object") {
				return JSON.stringify(arg, getCircularReplacer());
			} else if (typeof arg === "function") {
				return arg.toString();
			} else {
				return String(arg);
			}
		})
		.join(" ");
}

function getCircularReplacer() {
	const seen = new WeakSet();
	return (key: string, value: any) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) {
				return "[Circular]";
			}
			seen.add(value);
		}
		return value;
	};
}

async function appendLog(message: string) {
	try {
	    const appleBloxDir = path.dirname(await dataPath());
		await filesystem.appendFile(path.join(appleBloxDir,"appleblox.log"), message + "\n");
	} catch (err) {
		console.error("Failed to write log to file", err);
	}
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;
const originalConsoleDebug = console.debug;

let isRedirectionEnabled = true;

console.log = (...args: any[]) => {
	if (isRedirectionEnabled) {
		const formattedMessage = formatConsoleLog(...args);
		appendLog(formattedMessage);
	}
	originalConsoleLog.apply(console, args);
};

console.error = (...args: any[]) => {
	if (isRedirectionEnabled) {
		const formattedMessage = formatConsoleLog(...args);
		appendLog(formattedMessage);
	}
	originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
	if (isRedirectionEnabled) {
		const formattedMessage = formatConsoleLog(...args);
		appendLog(formattedMessage);
	}
	originalConsoleWarn.apply(console, args);
};

console.info = (...args: any[]) => {
	if (isRedirectionEnabled) {
		const formattedMessage = formatConsoleLog(...args);
		appendLog(formattedMessage);
	}
	originalConsoleInfo.apply(console, args);
};

console.debug = (...args: any[]) => {
	if (isRedirectionEnabled) {
		const formattedMessage = formatConsoleLog(...args);
		appendLog(formattedMessage);
	}
	originalConsoleDebug.apply(console, args);
};

export async function enableConsoleRedirection() {
	const appleBloxDir = path.dirname(await dataPath());
	if (!pathExists(appleBloxDir)) {
		await filesystem.createDirectory(appleBloxDir);
	}
	isRedirectionEnabled = true;
}

export function disableConsoleRedirection() {
	isRedirectionEnabled = false;
}
