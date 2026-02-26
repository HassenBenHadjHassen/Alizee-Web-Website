import { generate } from "critical";
import path from "path";

async function run() {
	await generate({
		base: path.resolve("./"),
		src: "creation-site-internet-pharmacie.html", // your HTML file
		target: {
			html: "creation-site-internet-pharmacie.critical.html", // HTML with inline critical CSS
		},
		width: 1300,
		height: 900,
		inline: true,
	});

	console.log("Critical CSS generated");
}

run().catch(console.error);
