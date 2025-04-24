import {json} from "@sveltejs/kit";

export async function POST({request}) {
    const requestBody = await request.json();
    console.log('Received request body:', requestBody);

    return json({ success: true });
}