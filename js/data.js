/**
 * 맨큐의 경제학 교과서 데이터 모듈
 * Mankiw's Principles of Economics - Chapter & Content Data
 */

const TEXTBOOK_DATA = {
  title: "맨큐의 경제학",
  edition: "제10판",
  author: "N. Gregory Mankiw",
  totalPages: 992,
  parts: [
    {
      id: 1,
      title: "서론",
      chapters: [
        {
          id: 1,
          title: "경제학의 10대 기본원리",
          pages: "1-30",
          keywords: ["희소성", "기회비용", "한계적 변화", "인센티브", "교역", "시장", "정부", "생산성", "인플레이션", "상충관계"],
          summary: "경제학의 근본 원리 10가지를 소개합니다. 사람들의 의사결정, 상호작용, 경제 전체의 작동 원리를 이해하는 기초를 형성합니다.",
          concepts: [
            { name: "상충관계", desc: "하나를 얻으려면 다른 하나를 포기해야 한다" },
            { name: "기회비용", desc: "어떤 것을 얻기 위해 포기해야 하는 모든 것" },
            { name: "한계적 변화", desc: "기존 행동계획에서 미세한 변화를 추구하는 것" },
            { name: "인센티브", desc: "사람들은 인센티브에 반응한다" }
          ]
        },
        {
          id: 2,
          title: "경제학자처럼 생각하기",
          pages: "31-56",
          keywords: ["과학적 방법", "가정", "경제모형", "순환흐름도", "생산가능곡선", "미시경제학", "거시경제학", "실증적 분석", "규범적 분석"],
          summary: "경제학자가 사용하는 분석 방법과 도구를 배웁니다. 과학적 사고방식, 모형 구축, 실증적/규범적 분석의 차이를 이해합니다.",
          concepts: [
            { name: "순환흐름도", desc: "가계와 기업이 시장에서 상호작용하는 과정" },
            { name: "생산가능곡선", desc: "경제가 생산할 수 있는 재화의 조합" },
            { name: "실증적 분석", desc: "세상이 어떤 것인지 설명하는 분석" },
            { name: "규범적 분석", desc: "세상이 어때야 하는지에 대한 분석" }
          ]
        },
        {
          id: 3,
          title: "상호의존과 교역의 이익",
          pages: "57-74",
          keywords: ["절대우위", "비교우위", "수입", "수출", "특화", "교역의 이익"],
          summary: "왜 국가와 개인이 서로 교역하면 이익을 얻는지 배웁니다. 비교우위의 원리가 교역의 근거가 됩니다.",
          concepts: [
            { name: "절대우위", desc: "다른 생산자보다 적은 투입요소로 생산하는 능력" },
            { name: "비교우위", desc: "기회비용이 더 적은 생산자가 가지는 우위" },
            { name: "특화", desc: "비교우위가 있는 재화를 생산함으로써 얻는 이익" }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "시장의 작동 원리",
      chapters: [
        {
          id: 4,
          title: "시장의 수요와 공급",
          pages: "75-106",
          keywords: ["수요곡선", "공급곡선", "균형", "균형가격", "균형거래량", "수요의 법칙", "공급의 법칙", "초과공급", "초과수요"],
          summary: "수요와 공급의 기본 원리를 배웁니다. 시장 균형이 어떻게 결정되는지 이해합니다.",
          concepts: [
            { name: "수요의 법칙", desc: "가격이 오르면 수요량이 감소한다" },
            { name: "공급의 법칙", desc: "가격이 오르면 공급량이 증가한다" },
            { name: "균형", desc: "수요량과 공급량이 일치하는 상태" }
          ]
        },
        {
          id: 5,
          title: "탄력성과 그 응용",
          pages: "107-132",
          keywords: ["수요의 가격탄력성", "공급의 가격탄력성", "소득탄력성", "교차탄력성", "탄력적", "비탄력적", "총수입"],
          summary: "탄력성 개념을 이해하고, 이를 통해 시장의 반응을 분석합니다.",
          concepts: [
            { name: "수요의 가격탄력성", desc: "가격 변화에 대한 수요량 변화의 민감도" },
            { name: "탄력적", desc: "탄력성이 1보다 큰 경우" },
            { name: "비탄력적", desc: "탄력성이 1보다 작은 경우" }
          ]
        },
        {
          id: 6,
          title: "수요, 공급과 정부정책",
          pages: "133-156",
          keywords: ["최고가격", "최저가격", "가격통제", "조세", "세금부담", "귀착"],
          summary: "정부의 가격통제와 조세 정책이 시장에 미치는 영향을 분석합니다.",
          concepts: [
            { name: "최고가격제", desc: "법으로 정한 최고 가격 (예: 임대료 규제)" },
            { name: "최저가격제", desc: "법으로 정한 최저 가격 (예: 최저임금)" },
            { name: "조세귀착", desc: "세금 부담이 시장 참여자들 사이에 분배되는 방식" }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "시장과 경제적 후생",
      chapters: [
        {
          id: 7,
          title: "소비자, 생산자, 시장의 효율성",
          pages: "157-178",
          keywords: ["소비자잉여", "생산자잉여", "총잉여", "효율성", "지불의사", "비용", "후생경제학"],
          summary: "시장 거래에서 발생하는 소비자잉여와 생산자잉여를 통해 시장 효율성을 평가합니다.",
          concepts: [
            { name: "소비자잉여", desc: "소비자의 지불의사에서 실제 지불액을 뺀 것" },
            { name: "생산자잉여", desc: "판매수입에서 생산비용을 뺀 것" },
            { name: "효율성", desc: "총잉여를 극대화하는 자원 배분" }
          ]
        },
        {
          id: 8,
          title: "응용: 조세의 경제적 비용",
          pages: "179-196",
          keywords: ["경제적 순손실", "사중손실", "조세수입", "래퍼곡선"],
          summary: "조세가 시장에 미치는 영향과 경제적 순손실(사중손실)을 분석합니다.",
          concepts: [
            { name: "경제적 순손실", desc: "조세로 인해 총잉여가 감소하는 부분" },
            { name: "래퍼곡선", desc: "세율과 조세수입의 관계를 나타내는 곡선" }
          ]
        },
        {
          id: 9,
          title: "응용: 국제무역",
          pages: "197-222",
          keywords: ["세계가격", "관세", "수입쿼터", "무역의 이익", "보호무역"],
          summary: "국제무역의 이론적 근거와 무역정책의 효과를 분석합니다.",
          concepts: [
            { name: "세계가격", desc: "국제시장에서 형성되는 가격" },
            { name: "관세", desc: "수입품에 부과되는 세금" },
            { name: "수입쿼터", desc: "수입 수량에 대한 제한" }
          ]
        }
      ]
    },
    {
      id: 4,
      title: "공공경제학",
      chapters: [
        {
          id: 10,
          title: "외부효과",
          pages: "223-250",
          keywords: ["외부효과", "부정적 외부효과", "긍정적 외부효과", "피구세", "교정적 보조금", "코즈정리", "배출권 거래제"],
          summary: "시장 거래가 제3자에게 미치는 영향, 즉 외부효과와 이에 대한 해결 방안을 분석합니다.",
          concepts: [
            { name: "부정적 외부효과", desc: "제3자에게 부정적 영향을 주는 효과 (예: 오염)" },
            { name: "피구세", desc: "부정적 외부효과를 교정하기 위한 세금" },
            { name: "코즈정리", desc: "재산권이 확립되면 사적 협상으로 외부효과 해결 가능" }
          ]
        },
        {
          id: 11,
          title: "공공재와 공유자원",
          pages: "251-270",
          keywords: ["공공재", "무임승차", "공유자원", "공유지의 비극", "배제성", "경합성", "클럽재"],
          summary: "배제성과 경합성에 따른 재화의 분류, 공공재와 공유자원의 문제를 다룹니다.",
          concepts: [
            { name: "공공재", desc: "배제성도 경합성도 없는 재화" },
            { name: "무임승차", desc: "대가를 지불하지 않고 혜택을 누리는 것" },
            { name: "공유지의 비극", desc: "공유자원이 과도하게 사용되는 현상" }
          ]
        },
        {
          id: 12,
          title: "조세제도의 설계",
          pages: "271-294",
          keywords: ["한계세율", "평균세율", "비례세", "누진세", "역진세", "효율성", "공평성", "수직적 공평성", "수평적 공평성"],
          summary: "좋은 조세제도의 원칙과 다양한 조세의 특성을 분석합니다.",
          concepts: [
            { name: "한계세율", desc: "추가 소득 1원에 부과되는 세율" },
            { name: "누진세", desc: "소득이 높을수록 세율이 높아지는 세금" },
            { name: "수직적 공평성", desc: "부담능력이 큰 사람이 더 많이 부담해야 한다" }
          ]
        }
      ]
    },
    {
      id: 5,
      title: "기업행동과 산업조직",
      chapters: [
        {
          id: 13,
          title: "생산비용",
          pages: "295-318",
          keywords: ["총수입", "총비용", "이윤", "명시적 비용", "암묵적 비용", "경제적 이윤", "고정비용", "가변비용", "한계비용", "평균총비용"],
          summary: "기업의 비용 구조를 분석합니다. 다양한 비용 개념과 비용곡선을 이해합니다.",
          concepts: [
            { name: "한계비용", desc: "추가 1단위 생산에 따른 총비용 증가분" },
            { name: "경제적 이윤", desc: "총수입에서 명시적+암묵적 비용을 뺀 것" },
            { name: "규모의 경제", desc: "생산량 증가 시 장기 평균총비용이 감소하는 현상" }
          ]
        },
        {
          id: 14,
          title: "경쟁시장의 기업",
          pages: "319-342",
          keywords: ["완전경쟁", "가격수용자", "한계수입", "이윤극대화", "기업의 공급곡선", "손익분기점", "조업중단점"],
          summary: "경쟁시장에서 기업이 이윤을 극대화하기 위한 의사결정을 분석합니다.",
          concepts: [
            { name: "가격수용자", desc: "시장가격을 주어진 것으로 받아들이는 기업" },
            { name: "이윤극대화", desc: "한계수입 = 한계비용인 산출량에서 이윤 극대화" },
            { name: "손익분기점", desc: "가격이 최소 평균총비용과 같은 점" }
          ]
        },
        {
          id: 15,
          title: "독점",
          pages: "343-374",
          keywords: ["독점", "시장지배력", "자연독점", "가격차별", "독점의 사회적 비용", "사중손실", "반독점정책"],
          summary: "독점시장의 특성, 독점기업의 가격결정, 독점의 사회적 비용을 분석합니다.",
          concepts: [
            { name: "독점", desc: "유일한 공급자가 시장 전체를 지배하는 시장 구조" },
            { name: "자연독점", desc: "규모의 경제로 단일기업이 효율적인 경우" },
            { name: "가격차별", desc: "같은 상품을 다른 소비자에게 다른 가격으로 판매" }
          ]
        },
        {
          id: 16,
          title: "독점적 경쟁",
          pages: "375-392",
          keywords: ["독점적 경쟁", "제품차별화", "초과생산능력", "마크업", "광고"],
          summary: "독점적 경쟁시장에서 기업의 행동과 시장 균형을 분석합니다.",
          concepts: [
            { name: "독점적 경쟁", desc: "제품차별화가 있는 많은 기업이 경쟁하는 시장" },
            { name: "초과생산능력", desc: "기업이 효율적 규모보다 적게 생산하는 것" },
            { name: "마크업", desc: "가격이 한계비용을 초과하는 정도" }
          ]
        },
        {
          id: 17,
          title: "과점",
          pages: "393-418",
          keywords: ["과점", "카르텔", "내시균형", "게임이론", "죄수의 딜레마", "담합", "지배전략"],
          summary: "소수의 기업이 시장을 지배하는 과점시장의 특성과 게임이론을 다룹니다.",
          concepts: [
            { name: "과점", desc: "소수의 기업이 시장을 지배하는 시장 구조" },
            { name: "내시균형", desc: "각 참가자의 전략이 최선의 대응인 상태" },
            { name: "죄수의 딜레마", desc: "개인적 합리성이 집단적 비합리성을 초래" }
          ]
        }
      ]
    },
    {
      id: 6,
      title: "노동시장의 경제학",
      chapters: [
        {
          id: 18,
          title: "생산요소시장",
          pages: "419-444",
          keywords: ["생산요소", "노동수요", "한계생산가치", "노동공급", "균형임금", "토지", "자본"],
          summary: "기업의 노동 수요와 가계의 노동 공급을 분석하여 임금 결정 원리를 이해합니다.",
          concepts: [
            { name: "한계생산가치", desc: "추가 1단위 노동의 생산이 기업에 가져다주는 가치" },
            { name: "노동수요", desc: "한계생산가치 = 임금인 노동량" }
          ]
        },
        {
          id: 19,
          title: "임금과 차별",
          pages: "445-466",
          keywords: ["보상적 격차", "인적자본", "차별", "수관노동", "능력", "노력", "행운"],
          summary: "임금 격차가 발생하는 원인을 분석하고 차별 문제를 경제학적으로 검토합니다.",
          concepts: [
            { name: "보상적 격차", desc: "일자리의 비금전적 특성 차이를 보상하는 임금 격차" },
            { name: "인적자본", desc: "교육, 훈련 등 노동자에 대한 투자" }
          ]
        },
        {
          id: 20,
          title: "소득불평등과 빈곤",
          pages: "467-494",
          keywords: ["빈곤율", "빈곤선", "소득불평등", "지니계수", "로렌츠곡선", "정부이전지출", "현물급여", "부의 소득세"],
          summary: "소득불평등 현황과 측정 방법, 그리고 이를 해결하기 위한 정부정책을 분석합니다.",
          concepts: [
            { name: "지니계수", desc: "소득분배의 불평등 정도를 나타내는 수치 (0~1)" },
            { name: "로렌츠곡선", desc: "인구의 누적 비율과 소득의 누적 비율 관계" }
          ]
        }
      ]
    },
    {
      id: 7,
      title: "소비자선택이론",
      chapters: [
        {
          id: 21,
          title: "소비자선택이론",
          pages: "495-520",
          keywords: ["예산제약", "무차별곡선", "한계대체율", "최적소비점", "소득효과", "대체효과", "기펜재"],
          summary: "소비자가 어떻게 최적의 소비 조합을 결정하는지 분석합니다.",
          concepts: [
            { name: "예산제약", desc: "소득과 가격이 주어진 상태에서 구매 가능한 조합" },
            { name: "무차별곡선", desc: "동일한 만족을 주는 재화 조합의 궤적" },
            { name: "한계대체율", desc: "소비자가 한 재화를 다른 재화로 대체하려는 비율" }
          ]
        }
      ]
    },
    {
      id: 8,
      title: "거시경제 데이터",
      chapters: [
        {
          id: 22,
          title: "국민소득의 측정",
          pages: "521-546",
          keywords: ["GDP", "국내총생산", "명목GDP", "실질GDP", "GDP디플레이터", "GNP"],
          summary: "GDP의 개념, 구성요소, 측정방법을 이해합니다.",
          concepts: [
            { name: "GDP", desc: "일정 기간 한 나라에서 생산된 모든 최종 재화·서비스의 시장가치" },
            { name: "실질GDP", desc: "기준연도의 가격으로 산출한 GDP" },
            { name: "GDP디플레이터", desc: "명목GDP/실질GDP × 100" }
          ]
        },
        {
          id: 23,
          title: "생계비의 측정",
          pages: "547-568",
          keywords: ["소비자물가지수", "CPI", "인플레이션율", "물가지수", "명목이자율", "실질이자율"],
          summary: "소비자물가지수(CPI)의 산출 방법과 인플레이션 측정을 이해합니다.",
          concepts: [
            { name: "CPI", desc: "전형적 소비자가 구입하는 재화·서비스 바구니의 비용" },
            { name: "인플레이션율", desc: "물가수준의 변화율" },
            { name: "실질이자율", desc: "명목이자율 - 인플레이션율" }
          ]
        }
      ]
    },
    {
      id: 9,
      title: "장기 실물경제",
      chapters: [
        {
          id: 24,
          title: "생산과 성장",
          pages: "569-596",
          keywords: ["생산성", "물적자본", "인적자본", "자연자원", "기술지식", "수확체감", "따라잡기효과"],
          summary: "국가 간 생활수준 차이의 원인과 경제성장 요인을 분석합니다.",
          concepts: [
            { name: "생산성", desc: "노동자 1인당 산출량" },
            { name: "수확체감", desc: "자본이 증가할수록 추가 자본의 한계생산이 감소" },
            { name: "따라잡기효과", desc: "가난한 나라가 부유한 나라보다 빠르게 성장하는 경향" }
          ]
        },
        {
          id: 25,
          title: "저축, 투자와 금융제도",
          pages: "597-624",
          keywords: ["금융제도", "금융시장", "금융중개기관", "국민저축", "투자", "대부자금시장", "구축효과"],
          summary: "금융제도의 역할과 저축·투자의 관계를 분석합니다.",
          concepts: [
            { name: "대부자금시장", desc: "저축자의 자금 공급과 투자자의 자금 수요를 연결하는 시장" },
            { name: "구축효과", desc: "정부 재정적자가 투자를 감소시키는 효과" }
          ]
        },
        {
          id: 26,
          title: "기본적인 금융수단",
          pages: "625-648",
          keywords: ["현재가치", "미래가치", "위험회피", "분산투자", "효율적 시장가설", "주가"],
          summary: "재무관리의 기본 개념과 금융시장의 효율성을 이해합니다.",
          concepts: [
            { name: "현재가치", desc: "미래 현금흐름의 현재 시점 가치" },
            { name: "분산투자", desc: "위험을 줄이기 위해 여러 자산에 투자" },
            { name: "효율적 시장가설", desc: "주가는 모든 공개 정보를 반영한다" }
          ]
        },
        {
          id: 27,
          title: "실업",
          pages: "649-674",
          keywords: ["실업률", "경제활동인구", "자연실업률", "마찰적 실업", "구조적 실업", "구직활동", "최저임금", "노동조합", "효율임금"],
          summary: "실업의 유형, 원인, 자연실업률을 이해합니다.",
          concepts: [
            { name: "자연실업률", desc: "경기변동이 없을 때 존재하는 일반적인 실업률" },
            { name: "마찰적 실업", desc: "일자리를 찾는 데 시간이 걸려 발생하는 실업" },
            { name: "구조적 실업", desc: "임금이 균형수준 이상으로 유지되어 발생하는 실업" }
          ]
        }
      ]
    },
    {
      id: 10,
      title: "화폐와 물가의 장기적 관계",
      chapters: [
        {
          id: 28,
          title: "통화제도",
          pages: "675-700",
          keywords: ["통화량", "중앙은행", "지급준비금", "통화승수", "공개시장조작", "화폐", "교환의 매개수단"],
          summary: "화폐의 기능, 중앙은행의 역할, 통화량 결정 과정을 이해합니다.",
          concepts: [
            { name: "통화승수", desc: "본원통화에 대한 통화량의 비율" },
            { name: "공개시장조작", desc: "중앙은행의 국채 매매를 통한 통화량 조절" }
          ]
        },
        {
          id: 29,
          title: "화폐성장과 인플레이션",
          pages: "701-728",
          keywords: ["화폐수량설", "화폐중립성", "피셔효과", "인플레이션 비용", "구두창 비용", "메뉴비용"],
          summary: "인플레이션의 원인과 비용을 분석합니다.",
          concepts: [
            { name: "화폐수량설", desc: "통화량이 물가수준을 결정한다" },
            { name: "화폐중립성", desc: "통화량 변화는 명목변수만 변화시키고 실질변수에 영향 없음" },
            { name: "피셔효과", desc: "인플레이션이 1%p 상승하면 명목이자율도 1%p 상승" }
          ]
        }
      ]
    },
    {
      id: 11,
      title: "개방경제의 거시경제학",
      chapters: [
        {
          id: 30,
          title: "개방경제 거시경제학: 기본개념",
          pages: "729-756",
          keywords: ["순수출", "순자본유출", "명목환율", "실질환율", "구매력평가"],
          summary: "개방경제의 기본 개념과 환율 결정을 이해합니다.",
          concepts: [
            { name: "순수출", desc: "수출 - 수입" },
            { name: "실질환율", desc: "두 나라 재화의 상대가격" },
            { name: "구매력평가", desc: "장기적으로 환율은 두 나라의 물가수준 비율과 같다" }
          ]
        },
        {
          id: 31,
          title: "개방경제의 거시경제학 이론",
          pages: "757-782",
          keywords: ["대부자금시장", "외환시장", "무역정책", "자본유출", "재정정책"],
          summary: "개방경제에서 대부자금시장과 외환시장이 어떻게 연결되는지 분석합니다.",
          concepts: [
            { name: "외환시장 균형", desc: "순자본유출이 순수출과 같아야 함" }
          ]
        }
      ]
    },
    {
      id: 12,
      title: "단기 경기변동",
      chapters: [
        {
          id: 32,
          title: "총수요와 총공급",
          pages: "783-816",
          keywords: ["경기변동", "경기침체", "경기확장", "총수요곡선", "총공급곡선", "스태그플레이션"],
          summary: "총수요-총공급 모형으로 경기변동을 분석합니다.",
          concepts: [
            { name: "총수요곡선", desc: "물가수준과 총수요량의 관계" },
            { name: "총공급곡선", desc: "물가수준과 총공급량의 관계" },
            { name: "스태그플레이션", desc: "인플레이션과 경기침체가 동시에 발생" }
          ]
        },
        {
          id: 33,
          title: "총수요와 재정 · 통화정책",
          pages: "817-848",
          keywords: ["승수효과", "구축효과", "유동성함정", "재정정책", "통화정책", "자동안정화장치"],
          summary: "정부의 재정정책과 중앙은행의 통화정책이 단기 경기변동에 미치는 영향을 분석합니다.",
          concepts: [
            { name: "승수효과", desc: "정부지출의 증가가 총수요를 더 크게 증가시키는 효과" },
            { name: "구축효과", desc: "확장적 재정정책이 이자율 상승→투자감소를 초래" },
            { name: "자동안정화장치", desc: "경기변동을 자동으로 완화하는 재정정책 (누진세, 실업급여 등)" }
          ]
        },
        {
          id: 34,
          title: "인플레이션과 실업의 단기 상충관계",
          pages: "849-878",
          keywords: ["필립스곡선", "자연실업률가설", "공급충격", "비용인상인플레이션", "희생비율"],
          summary: "필립스곡선을 통해 인플레이션과 실업의 관계를 분석합니다.",
          concepts: [
            { name: "필립스곡선", desc: "인플레이션과 실업의 단기 상충관계" },
            { name: "자연실업률가설", desc: "장기적으로 필립스곡선은 수직" },
            { name: "희생비율", desc: "인플레이션 1%p 감소에 필요한 GDP 감소율" }
          ]
        }
      ]
    },
    {
      id: 13,
      title: "마무리",
      chapters: [
        {
          id: 35,
          title: "거시경제정책의 다섯 가지 논쟁",
          pages: "879-900",
          keywords: ["재량적 정책", "준칙", "재정적자", "국가채무", "통화정책 준칙", "제로금리"],
          summary: "거시경제정책을 둘러싼 주요 논쟁들을 검토합니다.",
          concepts: [
            { name: "재량 vs 준칙", desc: "경제정책을 재량적으로 할 것인가, 준칙에 따를 것인가" },
            { name: "재정적자와 국가채무", desc: "정부 부채의 장기적 영향에 대한 논쟁" }
          ]
        },
        {
          id: 36,
          title: "부록: 주요 개념 정리",
          pages: "901-992",
          keywords: ["용어정리", "색인", "부록"],
          summary: "교과서 전체의 주요 개념 정리 및 부록입니다.",
          concepts: []
        }
      ]
    }
  ]
};

// Get all chapters as a flat array
function getAllChapters() {
  const chapters = [];
  TEXTBOOK_DATA.parts.forEach(part => {
    part.chapters.forEach(ch => {
      chapters.push({
        ...ch,
        partId: part.id,
        partTitle: part.title
      });
    });
  });
  return chapters;
}

// Search chapters by keyword
function searchChapters(query) {
  if (!query) return getAllChapters();
  const q = query.toLowerCase();
  return getAllChapters().filter(ch => {
    return ch.title.toLowerCase().includes(q) ||
      ch.keywords.some(k => k.toLowerCase().includes(q)) ||
      ch.summary.toLowerCase().includes(q) ||
      (ch.concepts && ch.concepts.some(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)));
  });
}

// Get chapter by ID
function getChapter(id) {
  return getAllChapters().find(ch => ch.id === parseInt(id));
}

// Get part by ID
function getPart(id) {
  return TEXTBOOK_DATA.parts.find(p => p.id === parseInt(id));
}

// Sample practice questions (Expanded for ALL 36 Chapters)
const PRACTICE_QUESTIONS = {
  1: [
    { id: 1, type: "multiple", question: "다음 중 기회비용의 정의로 가장 적절한 것은?", options: ["금전적 비용", "포기해야 하는 모든 것", "노동 시간", "시장가격"], answer: 1, explanation: "기회비용은 어떤 것을 얻기 위해 포기해야 하는 모든 것을 의미합니다." },
    { id: 2, type: "tf", question: "사람들은 인센티브에 반응한다.", answer: true, explanation: "경제학의 10대 기본원리 중 하나입니다." }
  ],
  2: [
    { id: 1, type: "tf", question: "경제모형은 현실을 복잡하게 만들기 위해 존재한다.", answer: false, explanation: "경제모형은 현실을 단순화(가정)하여 본질을 이해하기 위해 존재합니다." },
    { id: 2, type: "short", question: "경제학자가 '세상은 ~해야 한다'고 주장하는 분석은?", answer: "규범적 분석", explanation: "규범적 분석(normative analysis)은 가치 판단이 개입된 분석입니다." }
  ],
  3: [
    { id: 1, type: "multiple", question: "비교우위 원리에 따르면 국가는 어떤 재화를 수출해야 하는가?", options: ["절대우위 재화", "기회비용이 낮은 재화", "가격이 비싼 재화", "노동집약적 재화"], answer: 1, explanation: "각국은 기회비용이 낮은 재화에 특화하여 교역함으로써 이익을 얻습니다." }
  ],
  4: [
    { id: 1, type: "multiple", question: "가격이 상승하면 수요량이 감소하는 현상은?", options: ["수요의 법칙", "공급의 법칙", "엥겔의 법칙", "비교우위"], answer: 0, explanation: "가격과 수요량이 반대 방향으로 움직이는 것을 수요의 법칙이라 합니다." }
  ],
  5: [
    { id: 1, type: "short", question: "수요량 변화율이 가격 변화율보다 큰 경우, 수요는 ____적이다.", answer: "탄력", explanation: "탄력성 > 1 인 경우를 탄력적이라고 합니다." }
  ],
  6: [
    { id: 1, type: "multiple", question: "정부가 최저가격을 균형가격보다 높게 설정하면 발생하는 현상은?", options: ["초과수요", "초과공급", "균형거래량 증가", "시장청산"], answer: 1, explanation: "균형가격보다 높은 최저가격(예: 최저임금)은 공급량을 늘리고 수요량을 줄여 초과공급(실업)을 유발합니다." }
  ],
  7: [
    { id: 1, type: "multiple", question: "소비자잉여와 생산자잉여의 합은?", options: ["총수입", "총비용", "총잉여", "조세수입"], answer: 2, explanation: "시장의 총잉여(Total Surplus)는 소비자잉여와 생산자잉여의 합입니다." }
  ],
  8: [
    { id: 1, type: "tf", question: "세금이 부과되면 경제적 순손실(Deadweight Loss)이 발생한다.", answer: true, explanation: "세금은 시장 거래량을 최적 수준 이하로 줄여 총잉여를 감소시킵니다." }
  ],
  9: [
    { id: 1, type: "multiple", question: "관세(Tariff)를 부과하면 국내 가격은?", options: ["상승한다", "하락한다", "불변이다", "알 수 없다"], answer: 0, explanation: "관세는 수입품의 가격을 높여 국내 가격을 세계가격보다 높게 만듭니다." }
  ],
  10: [
    { id: 1, type: "short", question: "부정적 외부효과를 해결하기 위해 부과하는 세금은?", answer: "피구세", explanation: "피구세(Pigovian Tax)는 외부비용을 내부화하기 위한 수단입니다." }
  ],
  11: [
    { id: 1, type: "multiple", question: "경합성은 있으나 배제성이 없는 재화는?", options: ["사적 재화", "공공재", "공유자원", "클럽재"], answer: 2, explanation: "공유자원(예: 바다의 물고기)은 누구나 쓸 수 있지만(비배제성), 한 사람이 쓰면 다른 사람이 못 씁니다(경합성)." }
  ],
  12: [
    { id: 1, type: "tf", question: "누진세는 소득이 높을수록 평균세율이 낮아지는 제도다.", answer: false, explanation: "누진세는 소득이 높을수록 세율이 높아지는 제도입니다." }
  ],
  13: [
    { id: 1, type: "multiple", question: "생산량이 0일 때도 발생하는 비용은?", options: ["가변비용", "한계비용", "고정비용", "기회비용"], answer: 2, explanation: "고정비용(Fixed Cost)은 생산량과 무관하게 발생하는 비용입니다." }
  ],
  14: [
    { id: 1, type: "tf", question: "완전경쟁시장의 기업은 가격수용자(Price Taker)이다.", answer: true, explanation: "개별 기업은 시장 가격에 영향을 미칠 수 없습니다." }
  ],
  15: [
    { id: 1, type: "multiple", question: "독점기업의 이윤극대화 조건은?", options: ["P = MC", "MR = MC", "P = ATC", "MR = P"], answer: 1, explanation: "모든 기업의 이윤극대화 조건은 한계수입(MR) = 한계비용(MC)입니다." }
  ],
  16: [
    { id: 1, type: "short", question: "독점적 경쟁시장에서 기업들은 ____ 차별화를 통해 경쟁한다.", answer: "제품", explanation: "제품 차별화(Product Differentiation)가 독점적 경쟁의 핵심입니다." }
  ],
  17: [
    { id: 1, type: "multiple", question: "죄수의 딜레마에서 두 용의자의 우월전략은?", options: ["침묵", "자백", "협력", "회피"], answer: 1, explanation: "상대방의 선택과 무관하게 자백하는 것이 자신의 형량을 줄이는 우월전략입니다." }
  ],
  18: [
    { id: 1, type: "tf", question: "노동 수요는 파생 수요(Derived Demand)이다.", answer: true, explanation: "노동 수요는 최종 재화의 생산을 위해 필요하므로 파생적으로 결정됩니다." }
  ],
  19: [
    { id: 1, type: "multiple", question: "교육, 훈련 등을 통해 축적된 노동자의 능력은?", options: ["물적자본", "인적자본", "자연자본", "금융자본"], answer: 1, explanation: "인적자본(Human Capital)은 교육과 훈련으로 향상된 생산성을 의미합니다." }
  ],
  20: [
    { id: 1, type: "short", question: "소득불평등을 0에서 1 사이의 숫자로 나타낸 지수는?", answer: "지니계수", explanation: "지니계수(Gini Coefficient)가 0이면 완전 평등, 1이면 완전 불평등입니다." }
  ],
  21: [
    { id: 1, type: "multiple", question: "소비자가 동일한 만족을 얻는 재화 묶음을 연결한 곡선은?", options: ["예산선", "무차별곡선", "수요곡선", "등비용선"], answer: 1, explanation: "무차별곡선(Indifference Curve) 상의 모든 점은 효용이 같습니다." }
  ],
  22: [
    { id: 1, type: "multiple", question: "GDP에 포함되지 않는 것은?", options: ["신축 아파트 분양", "중고차 거래", "미용실 커트 비용", "국산차 수출"], answer: 1, explanation: "중고 거래는 과거에 생산된 것이므로 당해 GDP에 포함되지 않습니다." }
  ],
  23: [
    { id: 1, type: "tf", question: "CPI는 기업이 구입하는 재화의 가격 변동을 측정한다.", answer: false, explanation: "CPI(소비자물가지수)는 가계(소비자)가 구입하는 재화 바구니를 측정합니다. 기업은 PPI 등을 씁니다." }
  ],
  24: [
    { id: 1, type: "multiple", question: "생활수준 향상의 가장 중요한 요인은?", options: ["인구 증가", "생산성 향상", "노조 활동", "최저임금"], answer: 1, explanation: "장기적인 생활수준은 국가의 생산성(Productivity)에 달려 있습니다." }
  ],
  25: [
    { id: 1, type: "short", question: "재정적자로 인해 민간 투자가 감소하는 현상은?", answer: "구축효과", explanation: "Crowding-out effect: 정부 차입 증가가 이자율을 높여 민간 투자를 위축시킵니다." }
  ],
  26: [
    { id: 1, type: "tf", question: "효율적 시장 가설에 따르면 주가는 예측 불가능하다.", answer: true, explanation: "주가는 이미 모든 정보를 반영하고 있어(Random Walk), 초과 수익을 내기 어렵습니다." }
  ],
  27: [
    { id: 1, type: "multiple", question: "직장을 옮기는 과정에서 발생하는 일시적 실업은?", options: ["마찰적 실업", "구조적 실업", "경기적 실업", "계절적 실업"], answer: 0, explanation: "탐색 과정에서 발생하는 실업을 마찰적 실업(Frictional Unemployment)이라 합니다." }
  ],
  28: [
    { id: 1, type: "multiple", question: "중앙은행이 통화량을 늘리기 위한 정책은?", options: ["국채 매각", "국채 매입", "지급준비율 인상", "재할인율 인상"], answer: 1, explanation: "국채를 매입하면 시중에 돈을 풀게 되어 통화량이 증가합니다." }
  ],
  29: [
    { id: 1, type: "short", question: "화폐수량설 방정식: M × V = P × __", answer: "Y", explanation: "M(통화량) × V(유통속도) = P(물가) × Y(산출량)" }
  ],
  30: [
    { id: 1, type: "tf", question: "순자본유출(NCO)은 순수출(NX)과 항상 같다.", answer: true, explanation: "국민소득계정 항등식에 의해 NCO = NX 입니다." }
  ],
  31: [
    { id: 1, type: "multiple", question: "구매력평가설(PPP)에 따르면 환율은 무엇을 반영하는가?", options: ["이자율 차이", "물가수준 차이", "경제성장률 차이", "실업률 차이"], answer: 1, explanation: "장기적으로 환율은 두 나라 화폐의 구매력(물가) 비율과 같아집니다." }
  ],
  32: [
    { id: 1, type: "multiple", question: "경기가 침체되면서 물가가 오르는 현상은?", options: ["디플레이션", "스태그플레이션", "초인플레이션", "리세션"], answer: 1, explanation: "Stagnation + Inflation = Stagflation" }
  ],
  33: [
    { id: 1, type: "short", question: "정부지출 증가가 총수요를 더 크게 증가시키는 효과는?", answer: "승수효과", explanation: "Multiplier Effect: 지출이 소득을 낳고, 그 소득이 다시 지출을 낳는 연쇄 작용입니다." }
  ],
  34: [
    { id: 1, type: "multiple", question: "단기 필립스 곡선은 우하향한다. 이는 무엇과 무엇의 상충관계인가?", options: ["물가와 이자율", "실업률과 인플레이션율", "수출과 수입", "소비와 저축"], answer: 1, explanation: "실업률을 낮추려면 인플레이션을 감수해야 한다는 관계입니다." }
  ],
  35: [
    { id: 1, type: "tf", question: "재량적 통화정책은 시간 불일치(Time Inconsistency) 문제를 겪을 수 있다.", answer: true, explanation: "정책 결정자가 약속을 어기고 인플레이션을 유발할 유인이 있어 신뢰를 잃을 수 있습니다." }
  ],
  36: [
    { id: 1, type: "essay", question: "경제학의 10대 원리 중 가장 중요하다고 생각하는 것을 하나 고르고 그 이유를 설명하시오.", answer: "", explanation: "자유롭게 서술해 보세요. (예: 모든 선택에는 대가가 있다)" }
  ]
};

// Generate simple exam questions
function generateExamQuestions(chapters, count, types) {
  const allQuestions = [];
  chapters.forEach(chId => {
    if (PRACTICE_QUESTIONS[chId]) {
      PRACTICE_QUESTIONS[chId].forEach(q => {
        if (types.includes(q.type)) {
          allQuestions.push({ ...q, chapterId: chId });
        }
      });
    }
  });

  // Shuffle and limit
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
