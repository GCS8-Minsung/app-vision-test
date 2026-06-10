import type { MedicationProductEntry } from "./medicationDatabase";

interface IngredientSeedBlueprint {
  key: string;
  koreanName: string;
  englishName: string;
  strengths: string[];
  forms: string[];
  aliases?: string[];
  sourceNames?: string[];
  note?: string;
}

const COMMON_SOURCE = ["Clean Check 기본 성분 seed", "의약품안전나라 확인 필요"];

const BLUEPRINTS: IngredientSeedBlueprint[] = [
  { key: "acetaminophen", koreanName: "아세트아미노펜", englishName: "acetaminophen", strengths: ["160mg", "325mg", "500mg", "650mg"], forms: ["정", "시럽", "서방정"], aliases: ["paracetamol"] },
  { key: "ibuprofen", koreanName: "이부프로펜", englishName: "ibuprofen", strengths: ["100mg", "200mg", "400mg"], forms: ["정", "연질캡슐", "시럽"] },
  { key: "naproxen", koreanName: "나프록센", englishName: "naproxen", strengths: ["220mg", "250mg", "500mg"], forms: ["정", "연질캡슐"] },
  { key: "aspirin", koreanName: "아스피린", englishName: "aspirin", strengths: ["81mg", "100mg", "500mg"], forms: ["정", "장용정"] },
  { key: "diclofenac", koreanName: "디클로페낙", englishName: "diclofenac", strengths: ["25mg", "50mg", "75mg"], forms: ["정", "서방정", "겔"] },
  { key: "celecoxib", koreanName: "세레콕시브", englishName: "celecoxib", strengths: ["100mg", "200mg"], forms: ["캡슐", "정"] },
  { key: "loxoprofen", koreanName: "록소프로펜", englishName: "loxoprofen", strengths: ["60mg", "90mg"], forms: ["정", "첩부제"] },
  { key: "tramadol", koreanName: "트라마돌", englishName: "tramadol", strengths: ["37.5mg", "50mg"], forms: ["정", "캡슐", "주사"] },
  { key: "codeine", koreanName: "코데인", englishName: "codeine", strengths: ["10mg", "20mg"], forms: ["정", "시럽"] },
  { key: "morphine", koreanName: "모르핀", englishName: "morphine", strengths: ["5mg", "10mg"], forms: ["정", "주사"] },
  { key: "fentanyl", koreanName: "펜타닐", englishName: "fentanyl", strengths: ["12mcg", "25mcg", "50mcg"], forms: ["패치", "주사"] },
  { key: "cetirizine", koreanName: "세티리진", englishName: "cetirizine", strengths: ["5mg", "10mg"], forms: ["정", "시럽"] },
  { key: "levocetirizine", koreanName: "레보세티리진", englishName: "levocetirizine", strengths: ["5mg"], forms: ["정", "액"] },
  { key: "loratadine", koreanName: "로라타딘", englishName: "loratadine", strengths: ["10mg"], forms: ["정", "시럽"] },
  { key: "fexofenadine", koreanName: "펙소페나딘", englishName: "fexofenadine", strengths: ["30mg", "120mg", "180mg"], forms: ["정", "캡슐"] },
  { key: "chlorpheniramine", koreanName: "클로르페니라민", englishName: "chlorpheniramine", strengths: ["2mg", "4mg"], forms: ["정", "시럽"] },
  { key: "diphenhydramine", koreanName: "디펜히드라민", englishName: "diphenhydramine", strengths: ["25mg", "50mg"], forms: ["정", "캡슐"] },
  { key: "pseudoephedrine", koreanName: "슈도에페드린", englishName: "pseudoephedrine", strengths: ["30mg", "60mg", "120mg"], forms: ["정", "서방정"] },
  { key: "ephedrine", koreanName: "에페드린", englishName: "ephedrine", strengths: ["25mg", "50mg"], forms: ["정", "주사"] },
  { key: "methylephedrine", koreanName: "메틸에페드린", englishName: "methylephedrine", strengths: ["12.5mg", "25mg"], forms: ["정", "시럽"] },
  { key: "phenylephrine", koreanName: "페닐레프린", englishName: "phenylephrine", strengths: ["5mg", "10mg"], forms: ["정", "점비액"] },
  { key: "dextromethorphan", koreanName: "덱스트로메토르판", englishName: "dextromethorphan", strengths: ["10mg", "15mg", "30mg"], forms: ["정", "시럽"] },
  { key: "guaifenesin", koreanName: "구아이페네신", englishName: "guaifenesin", strengths: ["100mg", "200mg"], forms: ["정", "시럽"] },
  { key: "ambroxol", koreanName: "암브록솔", englishName: "ambroxol", strengths: ["15mg", "30mg"], forms: ["정", "시럽"] },
  { key: "acetylcysteine", koreanName: "아세틸시스테인", englishName: "acetylcysteine", strengths: ["100mg", "200mg", "600mg"], forms: ["캡슐", "산", "발포정"], aliases: ["nac"] },
  { key: "salbutamol", koreanName: "살부타몰", englishName: "salbutamol", strengths: ["100mcg", "2mg", "4mg"], forms: ["흡입제", "정", "액"] },
  { key: "formoterol", koreanName: "포르모테롤", englishName: "formoterol", strengths: ["4.5mcg", "9mcg"], forms: ["흡입제", "캡슐"] },
  { key: "salmeterol", koreanName: "살메테롤", englishName: "salmeterol", strengths: ["50mcg"], forms: ["흡입제", "디스커스"] },
  { key: "budesonide", koreanName: "부데소니드", englishName: "budesonide", strengths: ["100mcg", "200mcg"], forms: ["흡입제", "분무액"] },
  { key: "fluticasone", koreanName: "플루티카손", englishName: "fluticasone", strengths: ["50mcg", "125mcg", "250mcg"], forms: ["흡입제", "비강분무액"] },
  { key: "prednisolone", koreanName: "프레드니솔론", englishName: "prednisolone", strengths: ["5mg", "10mg"], forms: ["정", "시럽"] },
  { key: "methylprednisolone", koreanName: "메틸프레드니솔론", englishName: "methylprednisolone", strengths: ["4mg", "16mg", "40mg"], forms: ["정", "주사"] },
  { key: "dexamethasone", koreanName: "덱사메타손", englishName: "dexamethasone", strengths: ["0.5mg", "4mg"], forms: ["정", "주사"] },
  { key: "triamcinolone", koreanName: "트리암시놀론", englishName: "triamcinolone", strengths: ["4mg", "40mg"], forms: ["정", "주사"] },
  { key: "hydrocortisone", koreanName: "히드로코르티손", englishName: "hydrocortisone", strengths: ["10mg", "100mg"], forms: ["정", "주사", "크림"] },
  { key: "amoxicillin", koreanName: "아목시실린", englishName: "amoxicillin", strengths: ["250mg", "500mg"], forms: ["캡슐", "정", "건조시럽"] },
  { key: "amoxicillin-clavulanate", koreanName: "아목시실린클라불란산", englishName: "amoxicillin clavulanate", strengths: ["375mg", "625mg"], forms: ["정", "건조시럽"] },
  { key: "azithromycin", koreanName: "아지트로마이신", englishName: "azithromycin", strengths: ["250mg", "500mg"], forms: ["정", "건조시럽"] },
  { key: "clarithromycin", koreanName: "클래리트로마이신", englishName: "clarithromycin", strengths: ["250mg", "500mg"], forms: ["정", "건조시럽"] },
  { key: "cephalexin", koreanName: "세팔렉신", englishName: "cephalexin", strengths: ["250mg", "500mg"], forms: ["캡슐", "정"] },
  { key: "cefuroxime", koreanName: "세푸록심", englishName: "cefuroxime", strengths: ["250mg", "500mg"], forms: ["정", "주사"] },
  { key: "doxycycline", koreanName: "독시사이클린", englishName: "doxycycline", strengths: ["50mg", "100mg"], forms: ["캡슐", "정"] },
  { key: "ciprofloxacin", koreanName: "시프로플록사신", englishName: "ciprofloxacin", strengths: ["250mg", "500mg"], forms: ["정", "점안액"] },
  { key: "levofloxacin", koreanName: "레보플록사신", englishName: "levofloxacin", strengths: ["250mg", "500mg"], forms: ["정", "점안액"] },
  { key: "metronidazole", koreanName: "메트로니다졸", englishName: "metronidazole", strengths: ["250mg", "500mg"], forms: ["정", "주사"] },
  { key: "acyclovir", koreanName: "아시클로버", englishName: "acyclovir", strengths: ["200mg", "400mg"], forms: ["정", "크림"] },
  { key: "oseltamivir", koreanName: "오셀타미비르", englishName: "oseltamivir", strengths: ["30mg", "45mg", "75mg"], forms: ["캡슐", "현탁액"] },
  { key: "omeprazole", koreanName: "오메프라졸", englishName: "omeprazole", strengths: ["10mg", "20mg", "40mg"], forms: ["캡슐", "정"] },
  { key: "esomeprazole", koreanName: "에스오메프라졸", englishName: "esomeprazole", strengths: ["20mg", "40mg"], forms: ["정", "캡슐"] },
  { key: "lansoprazole", koreanName: "란소프라졸", englishName: "lansoprazole", strengths: ["15mg", "30mg"], forms: ["캡슐", "구강붕해정"] },
  { key: "pantoprazole", koreanName: "판토프라졸", englishName: "pantoprazole", strengths: ["20mg", "40mg"], forms: ["정", "주사"] },
  { key: "famotidine", koreanName: "파모티딘", englishName: "famotidine", strengths: ["10mg", "20mg"], forms: ["정", "주사"] },
  { key: "ranitidine", koreanName: "라니티딘", englishName: "ranitidine", strengths: ["75mg", "150mg"], forms: ["정", "주사"] },
  { key: "sucralfate", koreanName: "수크랄페이트", englishName: "sucralfate", strengths: ["1g"], forms: ["정", "현탁액"] },
  { key: "domperidone", koreanName: "돔페리돈", englishName: "domperidone", strengths: ["10mg"], forms: ["정", "현탁액"] },
  { key: "metoclopramide", koreanName: "메토클로프라미드", englishName: "metoclopramide", strengths: ["5mg", "10mg"], forms: ["정", "주사"] },
  { key: "ondansetron", koreanName: "온단세트론", englishName: "ondansetron", strengths: ["4mg", "8mg"], forms: ["정", "주사"] },
  { key: "loperamide", koreanName: "로페라미드", englishName: "loperamide", strengths: ["2mg"], forms: ["캡슐", "정"] },
  { key: "bisacodyl", koreanName: "비사코딜", englishName: "bisacodyl", strengths: ["5mg"], forms: ["정", "좌약"] },
  { key: "lactulose", koreanName: "락툴로오스", englishName: "lactulose", strengths: ["10g", "15ml"], forms: ["시럽", "액"] },
  { key: "simethicone", koreanName: "시메티콘", englishName: "simethicone", strengths: ["40mg", "80mg"], forms: ["정", "액"] },
  { key: "amlodipine", koreanName: "암로디핀", englishName: "amlodipine", strengths: ["2.5mg", "5mg", "10mg"], forms: ["정", "구강붕해정"] },
  { key: "losartan", koreanName: "로사르탄", englishName: "losartan", strengths: ["25mg", "50mg", "100mg"], forms: ["정", "필름코팅정"] },
  { key: "valsartan", koreanName: "발사르탄", englishName: "valsartan", strengths: ["40mg", "80mg", "160mg"], forms: ["정", "캡슐"] },
  { key: "telmisartan", koreanName: "텔미사르탄", englishName: "telmisartan", strengths: ["40mg", "80mg"], forms: ["정", "복합정"] },
  { key: "enalapril", koreanName: "에날라프릴", englishName: "enalapril", strengths: ["5mg", "10mg"], forms: ["정", "복합정"] },
  { key: "ramipril", koreanName: "라미프릴", englishName: "ramipril", strengths: ["2.5mg", "5mg", "10mg"], forms: ["캡슐", "정"] },
  { key: "atorvastatin", koreanName: "아토르바스타틴", englishName: "atorvastatin", strengths: ["10mg", "20mg", "40mg"], forms: ["정", "필름코팅정"] },
  { key: "rosuvastatin", koreanName: "로수바스타틴", englishName: "rosuvastatin", strengths: ["5mg", "10mg", "20mg"], forms: ["정", "필름코팅정"] },
  { key: "simvastatin", koreanName: "심바스타틴", englishName: "simvastatin", strengths: ["10mg", "20mg"], forms: ["정", "필름코팅정"] },
  { key: "ezetimibe", koreanName: "에제티미브", englishName: "ezetimibe", strengths: ["10mg"], forms: ["정", "복합정"] },
  { key: "metoprolol", koreanName: "메토프롤롤", englishName: "metoprolol", strengths: ["25mg", "50mg", "100mg"], forms: ["정", "서방정"] },
  { key: "bisoprolol", koreanName: "비소프롤롤", englishName: "bisoprolol", strengths: ["2.5mg", "5mg"], forms: ["정", "복합정"] },
  { key: "propranolol", koreanName: "프로프라놀롤", englishName: "propranolol", strengths: ["10mg", "40mg"], forms: ["정", "캡슐"] },
  { key: "atenolol", koreanName: "아테놀롤", englishName: "atenolol", strengths: ["25mg", "50mg"], forms: ["정", "복합정"] },
  { key: "furosemide", koreanName: "푸로세미드", englishName: "furosemide", strengths: ["20mg", "40mg"], forms: ["정", "주사"] },
  { key: "hydrochlorothiazide", koreanName: "히드로클로로티아지드", englishName: "hydrochlorothiazide", strengths: ["12.5mg", "25mg"], forms: ["정", "복합정"] },
  { key: "spironolactone", koreanName: "스피로노락톤", englishName: "spironolactone", strengths: ["25mg", "50mg"], forms: ["정", "필름코팅정"] },
  { key: "metformin", koreanName: "메트포르민", englishName: "metformin", strengths: ["250mg", "500mg", "1000mg"], forms: ["정", "서방정"] },
  { key: "glimepiride", koreanName: "글리메피리드", englishName: "glimepiride", strengths: ["1mg", "2mg", "4mg"], forms: ["정", "복합정"] },
  { key: "sitagliptin", koreanName: "시타글립틴", englishName: "sitagliptin", strengths: ["50mg", "100mg"], forms: ["정", "복합정"] },
  { key: "empagliflozin", koreanName: "엠파글리플로진", englishName: "empagliflozin", strengths: ["10mg", "25mg"], forms: ["정", "복합정"] },
  { key: "dapagliflozin", koreanName: "다파글리플로진", englishName: "dapagliflozin", strengths: ["5mg", "10mg"], forms: ["정", "복합정"] },
  { key: "insulin", koreanName: "인슐린", englishName: "insulin", strengths: ["100IU/ml", "300IU/ml"], forms: ["주사", "펜"] },
  { key: "levothyroxine", koreanName: "레보티록신", englishName: "levothyroxine", strengths: ["25mcg", "50mcg", "100mcg"], forms: ["정", "캡슐"] },
  { key: "methimazole", koreanName: "메티마졸", englishName: "methimazole", strengths: ["5mg", "10mg"], forms: ["정", "필름코팅정"] },
  { key: "methylphenidate", koreanName: "메틸페니데이트", englishName: "methylphenidate", strengths: ["5mg", "10mg", "18mg", "27mg"], forms: ["정", "서방정"] },
  { key: "modafinil", koreanName: "모다피닐", englishName: "modafinil", strengths: ["100mg", "200mg"], forms: ["정", "필름코팅정"] },
  { key: "zolpidem", koreanName: "졸피뎀", englishName: "zolpidem", strengths: ["5mg", "10mg"], forms: ["정", "서방정"] },
  { key: "alprazolam", koreanName: "알프라졸람", englishName: "alprazolam", strengths: ["0.25mg", "0.5mg"], forms: ["정", "서방정"] },
  { key: "diazepam", koreanName: "디아제팜", englishName: "diazepam", strengths: ["2mg", "5mg"], forms: ["정", "주사"] },
  { key: "lorazepam", koreanName: "로라제팜", englishName: "lorazepam", strengths: ["0.5mg", "1mg"], forms: ["정", "주사"] },
  { key: "fluoxetine", koreanName: "플루옥세틴", englishName: "fluoxetine", strengths: ["10mg", "20mg"], forms: ["캡슐", "정"] },
  { key: "sertraline", koreanName: "설트랄린", englishName: "sertraline", strengths: ["50mg", "100mg"], forms: ["정", "필름코팅정"] },
  { key: "escitalopram", koreanName: "에스시탈로프람", englishName: "escitalopram", strengths: ["5mg", "10mg", "20mg"], forms: ["정", "구강붕해정"] },
  { key: "quetiapine", koreanName: "쿠에티아핀", englishName: "quetiapine", strengths: ["25mg", "100mg", "200mg"], forms: ["정", "서방정"] },
  { key: "risperidone", koreanName: "리스페리돈", englishName: "risperidone", strengths: ["0.5mg", "1mg", "2mg"], forms: ["정", "구강붕해정"] },
  { key: "valproate", koreanName: "발프로산", englishName: "valproate", strengths: ["250mg", "500mg"], forms: ["정", "서방정", "시럽"] },
  { key: "carbamazepine", koreanName: "카르바마제핀", englishName: "carbamazepine", strengths: ["100mg", "200mg"], forms: ["정", "서방정"] },
  { key: "levetiracetam", koreanName: "레비라세탐", englishName: "levetiracetam", strengths: ["250mg", "500mg", "1000mg"], forms: ["정", "액"] },
  { key: "gabapentin", koreanName: "가바펜틴", englishName: "gabapentin", strengths: ["100mg", "300mg", "400mg"], forms: ["캡슐", "정"] },
  { key: "pregabalin", koreanName: "프레가발린", englishName: "pregabalin", strengths: ["75mg", "150mg"], forms: ["캡슐", "정"] },
  { key: "allopurinol", koreanName: "알로푸리놀", englishName: "allopurinol", strengths: ["100mg", "300mg"], forms: ["정", "필름코팅정"] },
  { key: "colchicine", koreanName: "콜히친", englishName: "colchicine", strengths: ["0.6mg"], forms: ["정", "캡슐"] },
  { key: "finasteride", koreanName: "피나스테리드", englishName: "finasteride", strengths: ["1mg", "5mg"], forms: ["정", "필름코팅정"] },
  { key: "tamsulosin", koreanName: "탐스로신", englishName: "tamsulosin", strengths: ["0.2mg", "0.4mg"], forms: ["캡슐", "서방정"] },
  { key: "sildenafil", koreanName: "실데나필", englishName: "sildenafil", strengths: ["25mg", "50mg", "100mg"], forms: ["정", "구강붕해정"] },
  { key: "caffeine", koreanName: "카페인", englishName: "caffeine", strengths: ["50mg", "100mg", "200mg"], forms: ["정", "캡슐"] },
  { key: "iron", koreanName: "철분", englishName: "iron", strengths: ["40mg", "80mg"], forms: ["정", "캡슐", "액"] },
  { key: "folic-acid", koreanName: "엽산", englishName: "folic acid", strengths: ["400mcg", "1mg"], forms: ["정", "캡슐"] },
  { key: "vitamin-d", koreanName: "비타민D", englishName: "cholecalciferol", strengths: ["1000IU", "2000IU"], forms: ["정", "캡슐", "액"] },
  { key: "magnesium", koreanName: "마그네슘", englishName: "magnesium", strengths: ["250mg", "500mg"], forms: ["정", "캡슐"] },
  { key: "zinc", koreanName: "아연", englishName: "zinc", strengths: ["10mg", "25mg"], forms: ["정", "캡슐"] }
];

function makeEntry(blueprint: IngredientSeedBlueprint, strength: string, form: string, index: number): MedicationProductEntry {
  const productName = `${blueprint.koreanName}${strength}${form}`;
  return {
    id: `bulk-${blueprint.key}-${strength.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    productName,
    aliases: [
      `${blueprint.koreanName} ${strength}`,
      `${blueprint.englishName} ${strength}`,
      `${blueprint.koreanName}${form}`,
      ...(blueprint.aliases ?? [])
    ],
    ingredients: [{ name: blueprint.englishName, dosage: strength }],
    dosage: `1${form.includes("시럽") || form.includes("액") ? "회" : form.includes("주사") ? "앰플" : "단위"}당 ${strength}`,
    form,
    sourceNames: blueprint.sourceNames ?? COMMON_SOURCE,
    note: blueprint.note ?? "기본 의약품 성분/함량 검색 seed입니다. 실제 제품명과 허가정보는 의약품안전나라 또는 약학정보원에서 재확인해야 합니다."
  };
}

export const BULK_MEDICATION_PRODUCT_DATABASE: MedicationProductEntry[] = BLUEPRINTS.flatMap((blueprint) =>
  blueprint.strengths.flatMap((strength) =>
    blueprint.forms.map((form, index) => makeEntry(blueprint, strength, form, index))
  )
);

export const BULK_MEDICATION_BLUEPRINT_COUNT = BLUEPRINTS.length;
