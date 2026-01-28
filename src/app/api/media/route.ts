import { formDataToObject } from "@lib/utils";
import { Storage } from "megajs";
import { NextRequest, NextResponse } from "next/server";
import path from "path"

type ResponseType = ({
  success: false;
  key: undefined;
} | {
  success: true;
  key: string;
})

export const POST = async (r: NextRequest) => {
  const data = formDataToObject(await r.formData()) as { files: File | File[] };

  const files = Array.isArray(data.files) ? data.files : [data.files]

  if (!files || !files.length)
    return Response.json({ success: false, error: "Missing Files" }, { status: 400 });

  const authorizationHeader = r.headers.get('authorization') || r.headers.get('Authorization')
  const apiKey = authorizationHeader?.split(' ')[1];

  if (apiKey !== process.env.MEDIA_UPLOAD_API_KEY)
    return NextResponse.json({ success: false, error: "Invalid API Key!" });

  try {

    const storage = await new Storage({
      autologin: true,
    }).ready;

    const response: ResponseType[] = await Promise.all(
      Array.from(files).map(async (file) => {
        const { size, name } = file;
        try {
          const fileBuff = await file.arrayBuffer();
          // Step 1: Get pre-signed upload URL
          const uploadedFile = await storage.upload({ name, size }, Buffer.from(fileBuff)).complete;

          const link = await uploadedFile.link({ key: uploadedFile.key?.toString() });
          const key = link.split("/file/")[1].split("#").join("-");

          const ext = path.extname(name);

          return { success: true, key: key.concat(ext) };
        } catch (err: any) {
          console.error("File upload failed:", err.message);
          return { success: false, key: undefined }
        }
      })
    );

    return Response.json({ success: true, response }, { status: 200 });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}