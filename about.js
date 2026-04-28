import path from 'node:path';
import fs from 'node:fs';
import fsAsync from 'node:fs/promises';
import readline from 'node:readline';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const HEADER_LINE_REGEX = /(#{1,3}\s)(.*)/;
const ISSUE_LINE_REGEX = /(\*\s+)(\[@?TAB-\d{3,}]\s)?(.*)/;

async function main() {
	try {
		await _createDistDirectory();

		const about = await _getAbout();
		await fsAsync.writeFile('./dist/version.json', JSON.stringify(about));

		console.log('Version information written to ./dist/version.json');
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

async function _createDistDirectory() {
	const distPath = path.join(__dirname, 'dist');

	try {
		await fsAsync.mkdir(distPath, { recursive: true });
	} catch (error) {
		throw new Error('Error creating dist directory:', {
			cause: error,
		});
	}
}

async function _getAbout() {
	try {
		const [stats, data] = await Promise.all([
			fsAsync.stat('./package.json'),
			fsAsync.readFile('./package.json', 'utf8'),
		]);
		const packageJsonData = JSON.parse(data);

		const config = process.env.NODE_ENV || 'local';
		const engines = packageJsonData.engines || {};
		const content = {};
		const processInfo = {
			platform: process.platform,
			version: process.version,
			release: process.release,
		};

		const result = {
			name: packageJsonData.name,
			version: packageJsonData.version,
			timestamp: stats.mtime,
			config,
			process: processInfo,
			engines,
			content,
		};

		if (packageJsonData.dependencies && packageJsonData.dependencies.mongodb)
			result.engines.mongodb = packageJsonData.dependencies.mongodb;

		if (packageJsonData.dependencies && packageJsonData.dependencies.mongoose)
			result.engines.mongoose = packageJsonData.dependencies.mongoose;

		if (result.config !== 'production') result.content.features = await _getFeatures(result.version);

		return result;
	} catch (error) {
		throw new Error('Error in gettings about data:', {
			cause: error,
		});
	}
}

async function _getFeatures(version) {
	const features = [];

	const changelogStream = fs.createReadStream('./CHANGELOG.md');
	const changelog = readline.createInterface({
		input: changelogStream,
		crlfDelay: Infinity,
	});

	let readingFeatures = false;
	let featureVersion;

	for await (const line of changelog) {
		const headerParts = line.match(HEADER_LINE_REGEX);

		if (readingFeatures) {
			const parts = line.match(ISSUE_LINE_REGEX);

			if (parts && parts.length > 2) {
				features.push({
					issue: (parts[parts.length - 2] || '').trim(),
					description: (parts[parts.length - 1] || '').trim(),
					version: featureVersion,
				});
			}
		}

		if (headerParts && headerParts.length) {
			featureVersion = headerParts[2] || '';
			readingFeatures = featureVersion.startsWith('NEXT') || featureVersion.indexOf(version) >= 0;
		}
	}

	return features;
}

main();
