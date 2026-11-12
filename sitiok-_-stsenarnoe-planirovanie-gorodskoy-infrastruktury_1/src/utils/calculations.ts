import { UrbanInputParams, UrbanCalculationResults, ScenarioPreset } from '../types';

export const DEFAULT_PARAMS: UrbanInputParams = {
  siteAreaHa: 10,
  floors: 3,
  buildingRatio: 0.4,
  avgApartmentArea: 55,
  familyRatio: 2.5,
  greeningNorm: 6,
  housingProvision: 30,
  shareKidsPreschool: 0.07,
  shareKidsSchool: 0.12,
  existingKindergartenPlaces: 0,
  existingSchoolPlaces: 0,
  existingParkingPlaces: 0,
};

export const KAZAN_NORMS = {
  maxBuildingDensity: 12, // тыс. м²/га
  maxPopulationDensity: 210, // чел./га
  minGreeningNorm: 6, // м²/чел.
  preschoolCoverageRate: 0.85, // 85%
  schoolCoverageRate: 0.95, // 95%
  parkingPermanentDivisor: 80, // м² жилья на 1 м/м
  parkingTemporaryDivisor: 560, // м² жилья на 1 м/м
};

export function calculateUrbanMetrics(params: UrbanInputParams): UrbanCalculationResults {
  // 1. Площадь застройки
  const buildingFootprintHa = params.siteAreaHa * params.buildingRatio;
  const buildingFootprintM2 = buildingFootprintHa * 10000;

  // 2. Общая площадь жилья = Площадь застройки × Этажность × 10000
  const totalHousingArea = buildingFootprintHa * params.floors * 10000;

  // 3. Плотность застройки = Общая площадь жилья / Площадь участка / 1000
  const buildingDensity = params.siteAreaHa > 0 ? (totalHousingArea / params.siteAreaHa / 1000) : 0;
  const buildingDensityOk = buildingDensity <= KAZAN_NORMS.maxBuildingDensity;

  // 4. Количество квартир = Общая площадь жилья / Средняя площадь квартиры
  const apartmentsCount = params.avgApartmentArea > 0 ? Math.round(totalHousingArea / params.avgApartmentArea) : 0;

  // 5. Численность населения = Количество квартир × Коэф. семейственности
  const population = Math.round(apartmentsCount * params.familyRatio);

  // 6. Плотность населения = Численность населения / Площадь участка
  const populationDensity = params.siteAreaHa > 0 ? (population / params.siteAreaHa) : 0;
  const populationDensityOk = populationDensity <= KAZAN_NORMS.maxPopulationDensity;

  // 7. Площадь озеленения = Численность населения × Норма озеленения
  const greeningArea = population * params.greeningNorm;
  const greeningProvision = population > 0 ? (greeningArea / population) : params.greeningNorm;
  const greeningProvisionOk = greeningProvision >= KAZAN_NORMS.minGreeningNorm;

  const totalPlotAreaM2 = params.siteAreaHa * 10000;
  const remainingPlotAreaM2 = Math.max(0, totalPlotAreaM2 - buildingFootprintM2);

  // 8. Требуемые места в садике = Численность населения × Доля детей 0-7 × 0.85 (85% охвата)
  const requiredKindergartenPlaces = Math.round(population * params.shareKidsPreschool * KAZAN_NORMS.preschoolCoverageRate);

  // 9. Требуемые места в школе = Численность населения × Доля детей 7-18 × 0.95 (95% охвата)
  const requiredSchoolPlaces = Math.round(population * params.shareKidsSchool * KAZAN_NORMS.schoolCoverageRate);

  // 10. Требуемые машиноместа (постоянные) = Общая площадь жилья / 80
  const requiredParkingPermanent = Math.round(totalHousingArea / KAZAN_NORMS.parkingPermanentDivisor);

  // 11. Требуемые машиноместа (временные) = Общая площадь жилья / 560
  const requiredParkingTemporary = Math.round(totalHousingArea / KAZAN_NORMS.parkingTemporaryDivisor);
  const requiredParkingTotal = requiredParkingPermanent + requiredParkingTemporary;

  // 12. Дефицит инфраструктуры
  const deficitKindergarten = requiredKindergartenPlaces - params.existingKindergartenPlaces;
  const deficitSchool = requiredSchoolPlaces - params.existingSchoolPlaces;
  const deficitParking = requiredParkingPermanent - params.existingParkingPlaces;
  const deficitParkingTotal = requiredParkingTotal - params.existingParkingPlaces;

  // Проценты покрытия
  const coverageKindergartenPercent = requiredKindergartenPlaces > 0
    ? Math.min(100, Math.round((params.existingKindergartenPlaces / requiredKindergartenPlaces) * 100))
    : 100;

  const coverageSchoolPercent = requiredSchoolPlaces > 0
    ? Math.min(100, Math.round((params.existingSchoolPlaces / requiredSchoolPlaces) * 100))
    : 100;

  const coverageParkingPercent = requiredParkingPermanent > 0
    ? Math.min(100, Math.round((params.existingParkingPlaces / requiredParkingPermanent) * 100))
    : 100;

  return {
    buildingFootprintHa: Number(buildingFootprintHa.toFixed(2)),
    buildingFootprintM2: Math.round(buildingFootprintM2),
    totalHousingArea: Math.round(totalHousingArea),
    buildingDensity: Number(buildingDensity.toFixed(2)),
    buildingDensityOk,
    apartmentsCount,
    population,
    populationDensity: Number(populationDensity.toFixed(1)),
    populationDensityOk,
    greeningArea: Math.round(greeningArea),
    greeningProvision: Number(greeningProvision.toFixed(1)),
    greeningProvisionOk,
    remainingPlotAreaM2: Math.round(remainingPlotAreaM2),
    requiredKindergartenPlaces,
    requiredSchoolPlaces,
    requiredParkingPermanent,
    requiredParkingTemporary,
    requiredParkingTotal,
    deficitKindergarten,
    deficitSchool,
    deficitParking,
    deficitParkingTotal,
    coverageKindergartenPercent,
    coverageSchoolPercent,
    coverageParkingPercent,
  };
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'mvp_default',
    name: 'Базовый сценарий (ТЗ)',
    tagline: '10 га · 3 этажа · Кз 0.4',
    description: 'Малоэтажная блокированная застройка с низкой плотностью и базовыми параметрами.',
    params: { ...DEFAULT_PARAMS },
  },
  {
    id: 'kazan_standard',
    name: 'Норматив Казани (Оптимум)',
    tagline: '10 га · 4 этажа · Кз 0.3',
    description: 'Сбалансированный сценарий: плотность 12.0 тыс. м²/га и комфортная нагрузка на соцобъекты.',
    params: {
      ...DEFAULT_PARAMS,
      siteAreaHa: 10,
      floors: 4,
      buildingRatio: 0.3,
      avgApartmentArea: 60,
      existingKindergartenPlaces: 120,
      existingSchoolPlaces: 250,
      existingParkingPlaces: 600,
    },
  },
  {
    id: 'comfort_quarter',
    name: 'Городской комфорт-квартал',
    tagline: '8 га · 7 этажей · Кз 0.28',
    description: 'Среднеэтажный европейский квартал с закрытыми дворами и развитой инфраструктурой.',
    params: {
      ...DEFAULT_PARAMS,
      siteAreaHa: 8,
      floors: 7,
      buildingRatio: 0.28,
      avgApartmentArea: 58,
      existingKindergartenPlaces: 220,
      existingSchoolPlaces: 400,
      existingParkingPlaces: 1200,
    },
  },
  {
    id: 'high_rise',
    name: 'Высотный микрорайон',
    tagline: '12 га · 16 этажей · Кз 0.22',
    description: 'Сценарий максимального градостроительного давления с выраженным дефицитом соцкультбыта.',
    params: {
      ...DEFAULT_PARAMS,
      siteAreaHa: 12,
      floors: 16,
      buildingRatio: 0.22,
      avgApartmentArea: 52,
      existingKindergartenPlaces: 180,
      existingSchoolPlaces: 350,
      existingParkingPlaces: 1500,
    },
  },
  {
    id: 'eco_suburb',
    name: 'Эко-поселок с садом',
    tagline: '6 га · 2 этажа · Озеленение 12 м²/чел',
    description: 'Пригородный жилой комплекс с повышенной нормой озеленения и 100% обеспеченностью.',
    params: {
      ...DEFAULT_PARAMS,
      siteAreaHa: 6,
      floors: 2,
      buildingRatio: 0.25,
      greeningNorm: 12,
      existingKindergartenPlaces: 50,
      existingSchoolPlaces: 100,
      existingParkingPlaces: 380,
    },
  },
];

export interface AiAnalyticalInsight {
  statusSeverity: 'success' | 'warning' | 'danger';
  headline: string;
  summary: string;
  recommendations: string[];
  metricsBreakdown: {
    schools: string;
    kindergartens: string;
    parking: string;
    kazanCompliance: string;
  };
}

export function generateAiUrbanAnalysis(params: UrbanInputParams, results: UrbanCalculationResults): AiAnalyticalInsight {
  const issues: string[] = [];
  const recs: string[] = [];
  let severity: 'success' | 'warning' | 'danger' = 'success';

  // Анализ плотности застройки по Казани (макс 12)
  if (!results.buildingDensityOk) {
    severity = 'danger';
    issues.push(`Превышение предельной плотности застройки Казани (${results.buildingDensity} при норме ≤ 12.0 тыс. м²/га)`);
    const targetFloors = Math.floor((12 * params.siteAreaHa * 1000) / (params.siteAreaHa * params.buildingRatio * 10000));
    recs.push(`Снизить этажность до ${Math.max(1, targetFloors)} эт. либо уменьшить коэффициент застройки до ${(12 / (params.floors * 10)).toFixed(2)}.`);
  }

  // Анализ плотности населения (макс 210)
  if (!results.populationDensityOk) {
    if (severity !== 'danger') severity = 'warning';
    issues.push(`Плотность населения ${results.populationDensity} чел./га превышает градостроительный лимит Казани (210 чел./га)`);
  }

  // Анализ школ
  if (results.deficitSchool > 0) {
    if (severity !== 'danger') severity = 'warning';
    if (results.deficitSchool > 500) {
      recs.push(`Дефицит мест в школах критический (-${results.deficitSchool.toLocaleString()} мест). Требуется проектирование отдельно стоящей СОШ типовой вместимости (на 550, 800 или 1224 мест) в границах планировочного элемента.`);
    } else {
      recs.push(`Дефицит мест в школах: -${results.deficitSchool.toLocaleString()} мест. Рекомендуется предусмотреть пристройку к ближайшей существующей СОШ или заключение соглашения КРТ (комплексного развития территории).`);
    }
  } else {
    recs.push(`Школьная инфраструктура полностью сбалансирована (+${Math.abs(results.deficitSchool)} резерв мест).`);
  }

  // Анализ детсадов
  if (results.deficitKindergarten > 0) {
    if (results.deficitKindergarten > 200) {
      recs.push(`Дефицит детских садов: -${results.deficitKindergarten.toLocaleString()} мест. Рекомендуется строительство 2-х детсадов по 140–180 мест либо одного типового ДОО на 260 мест.`);
    } else {
      recs.push(`Дефицит мест в детском саду: -${results.deficitKindergarten.toLocaleString()} мест. Возможно размещение встроенно-пристроенного детского сада на 1-2 этажах.`);
    }
  }

  // Анализ парковок
  if (results.deficitParking > 0) {
    recs.push(`Нехватка постоянных машиномест: -${results.deficitParking.toLocaleString()} м/м. Наземные открытые стоянки не покроют объем; запроектируйте полуподземный или многоуровневый паркинг.`);
  }

  let headline = 'Проект сбалансирован: социальная инфраструктура обеспечена';
  if (severity === 'danger') {
    headline = 'Критический дефицит и превышение нормативов градостроительства Казани';
  } else if (severity === 'warning') {
    headline = 'Выявлен дефицит социальных объектов — требуется компенсация';
  }

  const summary = `При параметрах ЖК (площадь ${params.siteAreaHa} га, ${params.floors} эт., прогнозируемое население ${results.population.toLocaleString('ru-RU')} чел.) расчетная нагрузка составляет: ${results.requiredSchoolPlaces} мест в школах и ${results.requiredKindergartenPlaces} мест в детсадах. Текущий дефицит: школ — ${results.deficitSchool > 0 ? results.deficitSchool : 0} мест, ДОО — ${results.deficitKindergarten > 0 ? results.deficitKindergarten : 0} мест, постоянных парковок — ${results.deficitParking > 0 ? results.deficitParking : 0} м/м.`;

  return {
    statusSeverity: severity,
    headline,
    summary,
    recommendations: recs,
    metricsBreakdown: {
      schools: results.deficitSchool > 0 ? `Дефицит ${results.deficitSchool} мест (${results.coverageSchoolPercent}% обеспечено)` : `Профицит +${Math.abs(results.deficitSchool)} мест (100%)`,
      kindergartens: results.deficitKindergarten > 0 ? `Дефицит ${results.deficitKindergarten} мест (${results.coverageKindergartenPercent}% обеспечено)` : `Профицит +${Math.abs(results.deficitKindergarten)} мест (100%)`,
      parking: results.deficitParking > 0 ? `Дефицит ${results.deficitParking} м/м (${results.coverageParkingPercent}% обеспечено)` : `Профицит +${Math.abs(results.deficitParking)} м/м (100%)`,
      kazanCompliance: results.buildingDensityOk && results.populationDensityOk ? 'Полное соответствие нормативам Казани' : 'Требуется корректировка ТЭП',
    },
  };
}

export function findOptimalFloorsForKazanNorm(params: UrbanInputParams): number {
  // Плотность застройки = (siteAreaHa * buildingRatio * floors * 10000) / siteAreaHa / 1000 = buildingRatio * floors * 10
  // buildingRatio * floors * 10 <= 12  => floors <= 1.2 / buildingRatio
  if (params.buildingRatio <= 0) return 3;
  const maxFloorsDensity = Math.floor(1.2 / params.buildingRatio);
  return Math.max(1, Math.min(50, maxFloorsDensity));
}

export function generateStreamlitPythonCode(params: UrbanInputParams): string {
  return `"""
Стартап-проект «СитиОК»
MVP ИИ-помощника для сценарного планирования городской инфраструктуры.
Расчет нагрузки нового ЖК на социальную и транспортную инфраструктуру (Нормативы г. Казань).
"""

import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="СитиОК — ИИ-планирование инфраструктуры ЖК",
    page_icon="🏙️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Стилизация в темно-синей и оранжевой палитре
st.markdown("""
<style>
    .main-title {
        color: #F97316;
        font-weight: 800;
        font-size: 2.2rem;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        color: #94A3B8;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .metric-box {
        background: #1E293B;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">🏙️ СитиОК</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">MVP ИИ-помощника для сценарного планирования социальной инфраструктуры жилых комплексов</div>', unsafe_allow_html=True)

# ----------------- 1. ВХОДНЫЕ ПАРАМЕТРЫ -----------------
with st.sidebar:
    st.header("⚙️ Параметры ЖК")
    
    site_area_ha = st.slider(
        "Площадь участка, га", 
        min_value=1.0, max_value=50.0, 
        value=float(${params.siteAreaHa}), step=0.5
    )
    
    floors = st.slider(
        "Этажность", 
        min_value=1, max_value=32, 
        value=int(${params.floors}), step=1
    )
    
    building_ratio = st.number_input(
        "Коэффициент застройки", 
        min_value=0.05, max_value=0.8, 
        value=float(${params.buildingRatio}), step=0.05
    )
    
    avg_apartment_area = st.number_input(
        "Средняя площадь квартиры, м²", 
        min_value=20.0, max_value=150.0, 
        value=float(${params.avgApartmentArea}), step=5.0
    )
    
    family_ratio = st.number_input(
        "Коэф. семейственности, чел./кв.", 
        min_value=1.0, max_value=5.0, 
        value=float(${params.familyRatio}), step=0.1
    )
    
    greening_norm = st.number_input(
        "Норма озеленения, м²/чел.", 
        min_value=1.0, max_value=25.0, 
        value=float(${params.greeningNorm}), step=1.0
    )
    
    housing_provision = st.number_input(
        "Жилищная обеспеченность, м²/чел.", 
        min_value=15.0, max_value=60.0, 
        value=float(${params.housingProvision}), step=1.0
    )
    
    share_kids_0_7 = st.number_input(
        "Доля детей 0-7 лет", 
        min_value=0.01, max_value=0.25, 
        value=float(${params.shareKidsPreschool}), step=0.01, format="%.2f"
    )
    
    share_kids_7_18 = st.number_input(
        "Доля детей 7-18 лет", 
        min_value=0.01, max_value=0.30, 
        value=float(${params.shareKidsSchool}), step=0.01, format="%.2f"
    )

    st.subheader("🏢 Существующая емкость")
    existing_kindergarten = st.number_input("Существующие места в садике", min_value=0, value=int(${params.existingKindergartenPlaces}), step=10)
    existing_school = st.number_input("Существующие места в школе", min_value=0, value=int(${params.existingSchoolPlaces}), step=10)
    existing_parking = st.number_input("Существующие машиноместа", min_value=0, value=int(${params.existingParkingPlaces}), step=20)

# ----------------- 2. ВЫЧИСЛИТЕЛЬНОЕ ЯДРО -----------------
building_footprint_ha = site_area_ha * building_ratio
total_housing_area = building_footprint_ha * floors * 10000
building_density = total_housing_area / site_area_ha / 1000  # тыс. м²/га
apartments_count = int(total_housing_area / avg_apartment_area) if avg_apartment_area > 0 else 0
population = int(apartments_count * family_ratio)
population_density = population / site_area_ha if site_area_ha > 0 else 0
greening_area = population * greening_norm
greening_provision = greening_area / population if population > 0 else 0

# Социальная инфраструктура
# Садик: 85% охвата детей 0-7 лет
req_kindergarten = int(round(population * share_kids_0_7 * 0.85))

# Школа: 95 мест на 100 детей (95% охвата детей 7-18 лет)
req_school = int(round(population * share_kids_7_18 * 0.95))

# Машиноместа
req_parking_permanent = int(round(total_housing_area / 80))
req_parking_temporary = int(round(total_housing_area / 560))
req_parking_total = req_parking_permanent + req_parking_temporary

# ----------------- 3. ДЕФИЦИТ ИНФРАСТРУКТУРЫ -----------------
deficit_kindergarten = req_kindergarten - existing_kindergarten
deficit_school = req_school - existing_school
deficit_parking = req_parking_permanent - existing_parking

# ----------------- 4. ВЫВОД РЕЗУЛЬТАТОВ -----------------
st.subheader("🚨 Ключевой блок: Дефицит инфраструктуры ЖК")
col_def1, col_def2, col_def3 = st.columns(3)

with col_def1:
    delta_text = f"{-deficit_school:+d} мест" if deficit_school > 0 else f"+{abs(deficit_school)} резерв"
    st.metric(
        label="Дефицит школы (7-18 лет)",
        value=f"{deficit_school} мест" if deficit_school > 0 else "Обеспечено",
        delta=delta_text,
        delta_color="inverse"
    )
    st.caption(f"Требуется: {req_school} | Существует: {existing_school}")

with col_def2:
    delta_text = f"{-deficit_kindergarten:+d} мест" if deficit_kindergarten > 0 else f"+{abs(deficit_kindergarten)} резерв"
    st.metric(
        label="Дефицит садика (0-7 лет)",
        value=f"{deficit_kindergarten} мест" if deficit_kindergarten > 0 else "Обеспечено",
        delta=delta_text,
        delta_color="inverse"
    )
    st.caption(f"Требуется: {req_kindergarten} | Существует: {existing_kindergarten}")

with col_def3:
    delta_text = f"{-deficit_parking:+d} м/м" if deficit_parking > 0 else f"+{abs(deficit_parking)} резерв"
    st.metric(
        label="Дефицит парковок (постоянных)",
        value=f"{deficit_parking} м/м" if deficit_parking > 0 else "Обеспечено",
        delta=delta_text,
        delta_color="inverse"
    )
    st.caption(f"Требуется: {req_parking_permanent} (всего: {req_parking_total}) | Существует: {existing_parking}")

st.markdown("---")

# ТЭП показатели
st.subheader("📊 Технико-экономические показатели (ТЭП)")
col1, col2, col3, col4 = st.columns(4)

with col1:
    density_status = "ОК" if building_density <= 12.0 else "Превышение!"
    st.metric("Плотность застройки", f"{building_density:.1f} тыс. м²/га", f"Норма Казани ≤12 ({density_status})")

with col2:
    pop_status = "ОК" if population_density <= 210.0 else "Превышение!"
    st.metric("Плотность населения", f"{population_density:.1f} чел./га", f"Норма ≤210 ({pop_status})")

with col3:
    st.metric("Население ЖК", f"{population:,} чел.", f"{apartments_count:,} квартир")

with col4:
    st.metric("Общая площадь жилья", f"{total_housing_area:,.0f} м²", f"Застройка: {building_footprint_ha:.1f} га")

# Аналитический вывод ИИ-помощника
st.markdown("---")
st.subheader("🤖 Аналитическое заключение ИИ-помощника «СитиОК»")

advice = []
if deficit_school > 0:
    advice.append(f"• Дефицит школьных мест составляет **{deficit_school} мест**. Рекомендуется рассмотреть проектирование пристройки к ближайшей школе или строительство нового корпуса на 550–800 учащихся.")
if deficit_kindergarten > 0:
    advice.append(f"• Дефицит дошкольных мест составляет **{deficit_kindergarten} мест**. Рекомендуется предусмотреть встроенно-пристроенный детский сад на 1-2 этажах либо отдельное ДОО на 140–220 мест.")
if deficit_parking > 0:
    advice.append(f"• Нехватка постоянных парковочных мест: **{deficit_parking} м/м**. Требуется проектирование многоуровневого либо подземного паркинга.")
if building_density > 12.0:
    optimal_floors = int(12.0 / (building_ratio * 10))
    advice.append(f"• Плотность застройки ({building_density:.1f}) превышает норматив Казани (12.0 тыс. м²/га). Рекомендуется снизить этажность с {floors} до **{optimal_floors} этажей**.")

if not advice:
    st.success("✅ Проект сбалансирован: все градостроительные нормативы Казани соблюдены, дефицит социальной инфраструктуры отсутствует.")
else:
    st.warning("\\n".join(advice))
`;
}
