import { generate } from "critical";
import path from "path";

async function run() {
	await generate({
		base: path.resolve("./"),
		src: "offre-speciale.html", // your HTML file
		target: {
			html: "offre-speciale.critical.html", // HTML with inline critical CSS
		},
		width: 1300,
		height: 900,
		inline: true,
	});

	console.log("Critical CSS generated");
}

run().catch(console.error);
