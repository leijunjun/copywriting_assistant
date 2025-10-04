import ky from "ky";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return ky(`${process.env.NEXT_PUBLIC_UPLOAD_API_URL}`, {
    method: 'POST',
    body: formData,
    timeout: false,
  }).then(res => res.json())
    .then((res: any) => {
      if (res?.data?.url) {
        return { data: res.data.url, status: 200 };
      }
      return { data: '', status: 400 };
    })
    .catch((error) => {
      return { data: error, status: 400 };
    })
}