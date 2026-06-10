import { expect, test } from "@playwright/test";

const forbiddenTerms = [
  "안전" + "합니다",
  "복용 " + "가능",
  "도핑 " + "아님",
  "공식 " + "판정",
  "증명 " + "완료",
  "대체약 " + "추천"
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("happy path", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("start-button").click();

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("이름").fill("김도핑");
  await page.getByLabel("생년월일").fill("2001-03-15");
  await page.getByLabel("종목").fill("육상");
  await page.getByLabel("소속/팀명").fill("테스트팀");
  await page.getByRole("button", { name: "다음으로 이동" }).click();

  await expect(page).toHaveURL(/\/upload/);
  await page.getByTestId("upload-type-select").selectOption("prescription");
  await page.getByTestId("file-input").setInputFiles({
    name: "methyl-prescription.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64"
    )
  });
  await page.getByTestId("upload-submit").click();

  await expect(page).toHaveURL(/\/review/);
  await page.getByLabel("약 이름/제품명").fill("콘서타정");
  await page.getByLabel("성분명").fill("methylphenidate");
  await page.getByLabel("용량").fill("18mg");
  await page.getByTestId("review-submit").click();

  await expect(page).toHaveURL(/\/result/);
  await expect(page.getByText("고위험 후보").first()).toBeVisible();
  await page.getByTestId("intake-status-taken").click();
  await expect(page.getByLabel("용량")).toHaveValue("18mg");
  await page.getByTestId("intake-save").click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId("dashboard")).toContainText("최근 7일 기록");
  await expect(page.getByText("1").first()).toBeVisible();
  await page.getByTestId("report-7-button").click();

  await expect(page).toHaveURL(/\/report\?days=7/);
  await expect(page.getByTestId("report-view")).toContainText("김도핑");
  await expect(page.getByTestId("report-view")).toContainText("콘서타정");
  await expect(page.getByTestId("report-view")).toContainText("18mg");
  await expect(page.getByTestId("report-view")).toContainText("고위험 후보");
  await expect(page.getByTestId("copy-share-link")).toBeVisible();
  await expect(page.getByTestId("print-report")).toBeVisible();
});

test("rendered pages do not expose blocked copy", async ({ page }) => {
  for (const path of ["/", "/onboarding", "/upload", "/dashboard", "/report?days=7"]) {
    await page.goto(path);
    const body = await page.locator("body").innerText();
    forbiddenTerms.forEach((term) => expect(body).not.toContain(term));
  }
});
