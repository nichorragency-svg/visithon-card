import {
  FaStethoscope,
  FaGraduationCap,
  FaLaptop,
  FaPenNib,
  FaCode,
  FaBuilding,
  FaHome,
  FaShapes,
} from 'react-icons/fa';

/**
 * Step 1 professions — each row has its own color + tile gradient (bling animation in WizardStep1).
 */
export const STEP1_PROFESSIONS = [
  {
    id: 'doctor',
    label: 'Doctor',
    Icon: FaStethoscope,
    tileClass:
      'border-cyan-400/35 bg-gradient-to-br from-cyan-500/30 via-teal-600/15 to-cyan-900/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
    iconClass: 'text-cyan-200',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    Icon: FaGraduationCap,
    tileClass:
      'border-amber-400/40 bg-gradient-to-br from-amber-400/35 via-orange-500/20 to-amber-900/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
    iconClass: 'text-amber-200',
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    Icon: FaLaptop,
    tileClass:
      'border-violet-400/35 bg-gradient-to-br from-violet-500/35 via-fuchsia-600/20 to-violet-900/25',
    iconClass: 'text-violet-200',
  },
  {
    id: 'designer',
    label: 'Designer',
    Icon: FaPenNib,
    tileClass:
      'border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/35 via-pink-500/25 to-purple-900/30',
    iconClass: 'text-fuchsia-200',
  },
  {
    id: 'developer',
    label: 'Developer',
    Icon: FaCode,
    tileClass:
      'border-emerald-400/35 bg-gradient-to-br from-emerald-500/35 via-teal-500/20 to-emerald-900/25',
    iconClass: 'text-emerald-200',
  },
  {
    id: 'business',
    label: 'Business',
    Icon: FaBuilding,
    tileClass:
      'border-sky-400/35 bg-gradient-to-br from-sky-500/35 via-indigo-500/25 to-slate-900/30',
    iconClass: 'text-sky-200',
  },
  {
    id: 'real_estate',
    label: 'Real Estate',
    Icon: FaHome,
    tileClass:
      'border-orange-400/40 bg-gradient-to-br from-orange-500/35 via-rose-500/20 to-orange-900/25',
    iconClass: 'text-orange-200',
  },
  {
    id: 'other',
    label: 'Other',
    Icon: FaShapes,
    tileClass:
      'border-white/25 bg-gradient-to-br from-indigo-400/25 via-fuchsia-500/25 to-cyan-500/25',
    iconClass: 'text-cyan-100',
  },
];
