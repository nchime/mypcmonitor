# mypcmonitor
<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License: MIT"/></a>
  <a href="#"><img src="https://img.shields.io/badge/version-1.0.0-brightgreen?style=flat-square" alt="version 1.0.0"/></a>
<br/>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js >= 18"/></a>
  <a href="https://github.com/vadimdemedes/ink"><img src="https://img.shields.io/badge/built%20with-Ink%207%20(React%20TUI)-cyan?style=flat-square" alt="Built with Ink"/></a>
  <a href="https://github.com/nchime/mypcmonitor"><img src="https://img.shields.io/github/stars/nchime/mypcmonitor?style=flat-square&label=stars" alt="GitHub stars"/></a>
  <a href="https://github.com/nchime/mypcmonitor"><img src="https://img.shields.io/github/last-commit/nchime/mypcmonitor?style=flat-square&logo=github&logoColor=white" alt="last commit"/></a>
  <a href="https://github.com/nchime/mypcmonitor"><img src="https://img.shields.io/github/issues/nchime/mypcmonitor?style=flat-square&label=issues" alt="open issues"/></a>
  <a href="https://github.com/nchime/mypcmonitor"><img src="https://img.shields.io/github/repo-size/nchime/mypcmonitor?style=flat-square&label=repo%20size" alt="repo size"/></a>
  <a href="https://github.com/nchime/mypcmonitor"><img src="https://img.shields.io/badge/commit%20by-git--master-red?style=flat-square" alt="git-master"/></a>
</p>


<!-- 스타/이슈/최근 커밋/저장소 크기 배지는 GitHub에 푸시된 후 자동 반영됩니다 -->
터미널에서 실행하는 로컬 PC 실시간 시스템 모니터링 대시보드 CLI.

React 기반 TUI 프레임워크 **Ink**로 제작된 터미널 UI와 **systeminformation** 기반의 실시간 메트릭 수집 조합으로, CPU·메모리·디스크·네트워크·프로세스를 0.5~3초 간격으로 갱신합니다.


## 주요 기능

| 위젯 | 표시 항목 |
|---|---|
| **CPU** | 사용률 스파크라인, 전체 사용률 막대, 코어별 사용률, 현재 클럭(GHz), 온도(macOS M 시리즈는 미지원) |
| **메모리** | 사용률 스파크라인, 사용률 막대(압박 기준), 사용/전체, 스왑 사용량 |
| **디스크** | 읽기/쓰기 속도, 마운트(볼륨)별 용량 사용률 최대 3개 |
| **네트워크** | 다운/업 스파크라인, 인터페이스별 누적·실시간 속도 |
| **프로세스** | 전체 프로세스 수, CPU/MEM 기준 정렬 테이블, 스크롤 |

### 단축키

| 키 | 동작 |
|---|---|
| `1` | CPU 기준 정렬 |
| `2` | 메모리 기준 정렬 |
| `3` | PID 기준 정렬 |
| `4` | 이름 기준 정렬 |
| `↑` / `↓` | 프로세스 목록 스크롤 |
| `q` | 종료 |
| `Ctrl+C` | 종료 |

---

## 요구사항

- **Node.js 18 이상** (권장: v20 LTS+)
- 터미널 크기 **최소 100x30** 권장 (더 작아도 동작하되 레이아웃이 좁아질 수 있음)
- 256색 이상 지원 터미널 (대부분의 기본 터미널/iTerm2/Windows Terminal OK)
- 데이터 수집이 **sudo 없이** 동작 (온도 제외 — 아래 "제한사항" 참조)

---

## 설치

### 1. 저장소 복제 & 의존성 설치

```bash
git clone <repository-url> mypcmonitor
cd mypcmonitor

# pnpm 권장 (npm/yarn도 사용 가능)
pnpm install
```

### 2. 프로덕션 빌드

```bash
pnpm build
```

---

## 사용법

### 개발 모드 (소스 직접 실행)

```bash
pnpm dev
```

> ⚠️ `tsx watch`(`pnpm dev:watch`)는 키 입력을 감지하면 프로세스를 재시작하므로
> stdin(raw key)을 직접 사용하는 이 TUI 앱과 호환되지 않습니다. 개발 시에는 `pnpm dev`를 사용하세요.

### 프로덕션 빌드 실행

```bash
pnpm start
```

### 빌드 산출물 직접 실행

```bash
node dist/index.js
```

### 전역 `mypcmonitor` 명령으로 설치

```bash
# 프로젝트 루트에서 실행
pnpm link --global

# 이제 어디서나 실행 가능
mypcmonitor
```

npm으로 로컬 설치(`npm i -g .`)나 `npx mypcmonitor`로도 동작하지만, 최초 1회 `pnpm build`로 `dist/`가 생성되어 있어야 합니다.

---

## 개발

```bash
# 타입 체크
pnpm typecheck

# 다시 빌드
pnpm build
```

### 스크립트 요약

| 스크립트 | 설명 |
|---|---|
| `pnpm build` | TypeScript → `dist/` 컴파일 |
| `pnpm dev` | tsx로 소스 직접 실행 (권장, watch 아님) |
| `pnpm dev:watch` | tsx watch 개발 서버 (TUI와 비호환, 주의) |
| `pnpm start` | 빌드 결과 실행 |
| `pnpm typecheck` | 타입 오류 검사 (실행하지 않음) |

---

## 프로젝트 구조

```
src/
├── index.tsx            # 엔트리 (데이터 수집 시작 + Ink 렌더)
├── types.ts             # 메트릭 스냅샷 타입 정의
├── core/
│   ├── store.ts         # 중앙 스토어 (EventEmitter pub/sub + 히스토리 링 버퍼 관리)
│   └── ringBuffer.ts    # 스파크라인용 원형 히스토리 버퍼
├── collectors/
│   ├── index.ts         # POLL_INTERVALS 정의 + 모니터 생성 (createMonitor)
│   ├── scheduler.ts     # chained setTimeout 스케줄러 (오버랩 방지)
│   ├── cpu.ts           # currentLoad + cpuCurrentSpeed + cpuTemperature
│   ├── memory.ts        # mem
│   ├── disk.ts          # fsSize + fsStats
│   ├── network.ts       # networkStats
│   └── processes.ts     # processes
└── ui/
    ├── App.tsx          # 대시보드 레이아웃 조립
    ├── format.ts        # 바이트/속도/시간 포맷, 퍼센트 색상 규칙
    ├── BarGauge.tsx     # ██████░░ 막대 게이지
    ├── Sparkline.tsx    # ▁▂▃▄▅▆▇█ 스파크라인
    └── widgets/
        ├── CpuWidget.tsx
        ├── MemoryWidget.tsx
        ├── DiskWidget.tsx
        ├── NetworkWidget.tsx
        └── ProcessWidget.tsx   # 정렬/스크롤/단축키 담당
```

---

## 데이터 수집 동작 방식

각 메트릭 클래스는 **독립적인 chained `setTimeout`** 으로 수집됩니다. 이 방식은 `setInterval` 대비 콜렉션 호출이 오래 걸릴 때의 중복 호출(오버랩)이 없고, 처리 시간을 빼서 다음 호출을 예약하므로 드리프트가 없습니다.

| 메트릭 | 폴링 간격 |
|---|---|
| CPU | 500ms |
| 메모리 | 1s |
| 네트워크 | 1s |
| 디스크 | 2s |
| 프로세스 | 3s |

수집된 데이터는 `MonitorStore`(EventEmitter)에 이벤트로 방출되고, React 컴포넌트는 구독하여 **리렌더에 필요한 스냅샷만 취득** 받습니다. 스파크라인은 120포인트 원형 버퍼에 유지됩니다.

---

## 제한사항 및 알려진 이슈

- **CPU 온도**: macOS Apple Silicon (M1/M2/M3)에서 `systeminformation.cpuTemperature()`가 온도를 노출하지 않아 "온도: 미지원"으로 표시됩니다. Intel 사용자는 `powermetrics`/`sudo` 없이도 온도 확인이 가능할 수 있습니다 (일부 아키텍처 한정).
- **iOS/Android 미지원**: 로컬 OS 기준 Windows / macOS / Linux를 대상으로 합니다.
- **프로세스 수**: macOS에서 프로세스 수(general ~700)가 많아 3초 간격으로 전체 스냅샷을 취득하며, 테이블은 화면 높이만큼 페이지네이션되어 표시됩니다.
- **레거시 터미널**: 256색 미지원 터미널에서는 색상 구분이 약해질 수 있습니다.

---

## 라이선스

MIT

---

## 관련 기술

- [ink](https://github.com/vadimdemedes/ink) · React 터미널 UI
- [systeminformation](https://github.com/sebhildebrandt/systeminformation) · 시스템 메트릭 라이브러리
- [typescript](https://www.typescriptlang.org/)