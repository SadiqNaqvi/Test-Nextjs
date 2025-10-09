import { formDataToObject } from "@lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (r: NextRequest) => {
  const data = formDataToObject(await r.formData()) as { files: File | File[] };

  const files = Array.isArray(data.files) ? data.files : [data.files]

  if (!files || !files.length)
    return Response.json({ success: false, error: "Missing Files" }, { status: 400 });

  const apiKey = r.headers.get('authorization')?.split(' ')[1];

  if (apiKey !=== process.env.MEDIA_UPLOAD_API_KEY)
  return NextResponse.json({ success: false, error: "Invalid API Key!" })

  try {
    const response: ({
      success: false;
      file_name: string;
      error: string;
      url: undefined;
    } | {
      success: true;
      url: string;
      file_name: string;
      error: undefined;
    })[] = await Promise.all(
      Array.from(files).map(async (file) => {
        const { size, name } = file;

        // Step 1: Get pre-signed upload URL
        const presignResp = await fetch(
          "https://ranoz.gg/api/v1/files/upload_url",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: name, size }),
          }
        );

        if (!presignResp.ok) {
          return {
            success: false,
            file_name: name,
            error: await presignResp.text(),
          };
        }

        const {
          data: { upload_url, filename, id },
        } = await presignResp.json();

        const uploadResp = await fetch(upload_url, {
          method: "PUT",
          body: await file.arrayBuffer(),
        });

        if (!uploadResp.ok) {
          return {
            success: false,
            file_name: name,
            error: "Something went wrong during file upload",
          };
        }
        const storage = upload_url.split(".")[0].split("/").at(-1);

        return {
          success: true,
          url: `${storage}-${id}-${filename}`,
          file_name: name,
        };
      })
    );

    return Response.json({ success: true, response }, { status: 200 });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}