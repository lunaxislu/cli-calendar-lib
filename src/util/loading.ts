import ora, { type Options } from "ora";

export function loading(
  text: Options["text"],
  options?: {
    silent?: boolean;
  },
) {
  return ora({
    text,
    isSilent: options?.silent, // silent가 true일 때 스피너를 출력하지 않음
  });
}
