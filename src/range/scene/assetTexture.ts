import { Asset } from "expo-asset";
import { Texture } from "three";

// RN에는 document/<img>가 없어 three의 TextureLoader(ImageLoader)를 쓸 수 없다.
// expo-asset으로 파일을 받은 뒤, 텍스처를 isDataTexture 경로로 위장해 three가
// gl.texImage2D(..., image.data)를 호출하게 하면 expo-gl이 Asset(localUri)을
// 네이티브에서 직접 디코드/업로드한다 (expo-three의 TextureLoader와 같은 기법).
export async function loadAssetTexture(moduleId: number): Promise<Texture> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();

  const texture = new Texture();
  texture.image = {
    data: asset,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
  };
  (texture as unknown as { isDataTexture: boolean }).isDataTexture = true;
  texture.needsUpdate = true;
  return texture;
}
