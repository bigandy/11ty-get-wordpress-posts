const fetch = require("node-fetch");
const fs = require("fs-extra");

const site = process.argv[2] ? process.argv[2] : "big-andy.co.uk";

console.log(`Getting Posts JSON for ${site}`);

const POSTS_DIR = "posts";
const API_URL = `https://${site}/wp-json/wp/v2/posts`;

const createDir = async directory => {
	try {
		await fs.ensureDir(directory);
		console.log(`successfully created ${directory}!`);
	} catch (error) {
		console.error("error in createDir", error);
	}
};

const writeJSONFile = async (filePath, data) => {
	try {
		await fs.writeJson(`${filePath}.json`, data);
		console.log(`successfully written to ${filePath}.json!`);
	} catch (error) {
		console.error("error in writeJSONFile", error);
	}
};

const getNumberofPages = async () => {
	const response = await fetch(API_URL);
	const headers = await response.headers;

	const numberofPages = headers.get("x-wp-totalpages");

	return numberofPages;
};

const getContentJSON = async () => {
	const posts = [];
	const numberOfPages = await getNumberofPages();

	// Get the data
	// 1. Loop through numberOfPages and add to posts
	for (let i = 1; i <= numberOfPages; i++) {
		const page = await fetch(`${API_URL}/?page=${i}`);
		const json = await page.json();

		if (!json) {
			return;
		}

		// map body onto new array with just title and id
		const reducedBody = json.map(post => {
			return {
				date: post.date,
				id: post.id,
				title: post.title.rendered,
				excerpt: post.excerpt.rendered,
				content: post.content.rendered
			};
		});

		posts.push(reducedBody);
	}

	// write to json file.
	// 1. Create Directory if not exists
	await createDir("POSTS_DIR");

	// 2. Write to file
	await writeJSONFile(`${POSTS_DIR}/${site}`, posts);
};
getContentJSON();
