import { defineConfig } from "tsup";

export default defineConfig({
  clean: true, // 빌드 전에 dist 폴더를 정리
  dts: true, // TypeScript의 타입 정의 파일을 생성
  entry: ["src/index.ts"], // 번들링할 엔트리 파일
  format: ["esm"], // ESM 형식으로 번들
  sourcemap: true, // 소스맵 생성
  minify: true, // 코드 최소화

  target: "esnext", // 최신 ESNext로 타겟 설정
  outDir: "dist", // 번들된 파일이 저장될 디렉토리
  tsconfig: "./tsconfig.json", // TypeScript 설정 파일 지정
});
