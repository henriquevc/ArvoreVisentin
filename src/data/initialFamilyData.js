// Initial genealogical tree dataset for the Visentin family
// Immigrants from Italy: Giuseppe & Catterina Visentin + 5 children
// 6 Generations with >14 bisnetos for each of the 5 immigrant children

export const BRANCHES = [
  {
    id: 'all',
    name: 'Visão Geral (Toda a Família)',
    patriarch: 'Giuseppe & Catterina',
    color: '#133926',
    accent: '#c89f56',
    bgBadge: 'bg-emerald-900 text-amber-100 border-amber-500/40',
    description: 'A árvore completa da Família Visentin desde a imigração da Itália.'
  },
  {
    id: 'antonio',
    name: 'Ramo Antonio Visentin',
    patriarch: 'Antonio Visentin (1º Filho)',
    shortName: 'Antonio',
    color: '#1b4d3e',
    accent: '#4ade80',
    bgBadge: 'bg-emerald-800 text-emerald-100 border-emerald-400/40',
    description: 'Descendência do primeiro filho imigrante Antonio.'
  },
  {
    id: 'giovanni',
    name: 'Ramo Giovanni Visentin',
    patriarch: 'Giovanni Visentin (2º Filho)',
    shortName: 'Giovanni',
    color: '#1e3a5f',
    accent: '#38bdf8',
    bgBadge: 'bg-sky-900 text-sky-100 border-sky-400/40',
    description: 'Descendência do segundo filho imigrante Giovanni.'
  },
  {
    id: 'maria',
    name: 'Ramo Maria Visentin',
    patriarch: 'Maria Visentin (3ª Filha)',
    shortName: 'Maria',
    color: '#4d381e',
    accent: '#fbbf24',
    bgBadge: 'bg-amber-900 text-amber-100 border-amber-400/40',
    description: 'Descendência da terceira filha imigrante Maria.'
  },
  {
    id: 'francesco',
    name: 'Ramo Francesco Visentin',
    patriarch: 'Francesco Visentin (4º Filho)',
    shortName: 'Francesco',
    color: '#284e3a',
    accent: '#86efac',
    bgBadge: 'bg-teal-900 text-teal-100 border-teal-400/40',
    description: 'Descendência do quarto filho imigrante Francesco.'
  },
  {
    id: 'lucia',
    name: 'Ramo Lucia Visentin',
    patriarch: 'Lucia Visentin (5ª Filha)',
    shortName: 'Lucia',
    color: '#3d284e',
    accent: '#c084fc',
    bgBadge: 'bg-purple-900 text-purple-100 border-purple-400/40',
    description: 'Descendência da quinta filha imigrante Lucia.'
  }
];

// Helper to sort members by manual birth order (or fallback to birth year)
export function sortMembersByOrder(memberList = []) {
  return [...memberList].sort((a, b) => {
    const orderA = a.order !== undefined && a.order !== null && a.order !== '' ? Number(a.order) : null;
    const orderB = b.order !== undefined && b.order !== null && b.order !== '' ? Number(b.order) : null;

    if (orderA !== null && orderB !== null) {
      return orderA - orderB;
    }
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;

    // Fallback: compare birth year if present
    const yearA = parseInt(a.birthDate, 10);
    const yearB = parseInt(b.birthDate, 10);
    if (!isNaN(yearA) && !isNaN(yearB)) {
      return yearA - yearB;
    }
    if (!isNaN(yearA)) return -1;
    if (!isNaN(yearB)) return 1;

    return 0;
  });
}

// Helper to compute branch names dynamically based on the current members in memory/storage
export function getBranches(members = []) {
  if (!members || members.length === 0) return BRANCHES;

  const g1 = members.filter((m) => m.generation === 1);
  const giuseppe = g1.find((m) => m.gender === 'M');
  const catterina = g1.find((m) => m.gender === 'F');
  const patriarchNames = giuseppe && catterina
    ? `${giuseppe.name.split(' ')[0]} & ${catterina.name.split(' ')[0]}`
    : 'Giuseppe & Catterina';

  const allBranch = {
    ...BRANCHES[0],
    patriarch: patriarchNames
  };

  const branchList = BRANCHES.filter((b) => b.id !== 'all').map((b) => {
    // Find the Generation 2 immigrant child who founds this branch
    const founder = members.find(
      (m) => (m.branchId === b.id && m.generation === 2) || m.id === `p-${b.id}`
    );

    if (founder && founder.name) {
      const shortName = founder.name.split(' ')[0];
      return {
        ...b,
        name: `Ramo ${founder.name}`,
        patriarch: founder.name,
        founderName: founder.name,
        shortName: shortName,
        order: founder.order !== undefined && founder.order !== null && founder.order !== '' ? Number(founder.order) : 999,
        birthDate: founder.birthDate,
        description: `Descendência de ${founder.name}.`
      };
    }

    return {
      ...b,
      order: 999
    };
  });

  // Sort branches in the exact birth order of the 5 immigrant children
  branchList.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    const yearA = parseInt(a.birthDate, 10) || 9999;
    const yearB = parseInt(b.birthDate, 10) || 9999;
    return yearA - yearB;
  });

  return [allBranch, ...branchList];
}

export const GENERATION_LABELS = {
  1: '1ª Geração • Patriarcas Imigrantes',
  2: '2ª Geração • Filhos Imigrantes',
  3: '3ª Geração • Netos',
  4: '4ª Geração • Bisnetos',
  5: '5ª Geração • Trinetos',
  6: '6ª Geração • Tetranetos'
};

// Realistic Italian & Brazilian names for generation expansion
export const sampleFamilyMembers = [
  // ==========================================
  // GERAÇÃO 1: OS PATRIARCAS IMIGRANTES
  // ==========================================
  {
    id: 'p-giuseppe',
    name: 'Giuseppe Visentin',
    gender: 'M',
    generation: 1,
    branchId: 'all',
    parents: [],
    spouseName: 'Catterina Visentin (n. Sartori)',
    spouseId: 'p-catarina',
    children: ['p-antonio', 'p-giovanni', 'p-maria', 'p-francesco', 'p-lucia'],
    birthDate: '1852',
    birthPlace: 'Treviso, Vêneto, Itália',
    deathDate: '1927',
    deathPlace: 'Brasil',
    isLiving: false,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Patriarca da família Visentin. Partiu de Gênova no final do século XIX rumo ao Brasil com a esposa Catterina e seus 5 filhos pequenos, em busca de novas terras e prosperidade.'
  },
  {
    id: 'p-catarina',
    name: 'Catterina Visentin',
    maidenName: 'Sartori',
    gender: 'F',
    generation: 1,
    branchId: 'all',
    parents: [],
    spouseName: 'Giuseppe Visentin',
    spouseId: 'p-giuseppe',
    children: ['p-antonio', 'p-giovanni', 'p-maria', 'p-francesco', 'p-lucia'],
    birthDate: '1856',
    birthPlace: 'Treviso, Vêneto, Itália',
    deathDate: '1934',
    deathPlace: 'Brasil',
    isLiving: false,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Matriarca corajosa da família. Guardiã das tradições culinárias vênetas, canções e fé católica que uniram a família nas primeiras colônias.'
  },

  // ==========================================
  // GERAÇÃO 2: OS 5 FILHOS QUE VIERAM DA ITÁLIA
  // ==========================================
  {
    id: 'p-antonio',
    name: 'Antonio Visentin',
    gender: 'M',
    generation: 2,
    order: 1,
    branchId: 'antonio',
    parents: ['p-giuseppe', 'p-catarina'],
    spouseName: 'Rosa Moretti',
    children: ['p-ant-n1', 'p-ant-n2', 'p-ant-n3', 'p-ant-n4'],
    birthDate: '1878',
    birthPlace: 'Vêneto, Itália',
    deathDate: '1955',
    deathPlace: 'Brasil',
    isLiving: false,
    photo: null,
    bio: 'Primogênito de Giuseppe e Catterina. Chegou ao Brasil ainda menino. Auxiliou o pai na agricultura e fundou uma das maiores linhagens da família.'
  },
  {
    id: 'p-giovanni',
    name: 'Giovanni Visentin',
    gender: 'M',
    generation: 2,
    order: 2,
    branchId: 'giovanni',
    parents: ['p-giuseppe', 'p-catarina'],
    spouseName: 'Elena Ferrari',
    children: ['p-gio-n1', 'p-gio-n2', 'p-gio-n3', 'p-gio-n4'],
    birthDate: '1881',
    birthPlace: 'Vêneto, Itália',
    deathDate: '1960',
    deathPlace: 'Brasil',
    isLiving: false,
    photo: null,
    bio: 'Segundo filho imigrante. Conhecido pelo talento como marceneiro e construtor, ajudou a erguer as primeiras capelas e casas da comunidade.'
  },
  {
    id: 'p-maria',
    name: 'Maria Visentin',
    gender: 'F',
    generation: 2,
    order: 3,
    branchId: 'maria',
    parents: ['p-giuseppe', 'p-catarina'],
    spouseName: 'Pietro Zanella',
    children: ['p-mar-n1', 'p-mar-n2', 'p-mar-n3', 'p-mar-n4'],
    birthDate: '1883',
    birthPlace: 'Vêneto, Itália',
    deathDate: '1964',
    deathPlace: 'Brasil',
    isLiving: false,
    photo: null,
    bio: 'Terceira filha imigrante. Mulher de forte liderança comunitária, manteve viva a língua vêneta (Talian) entre seus filhos e netos.'
  },
  {
    id: 'p-francesco',
    name: 'Francesco Visentin',
    gender: 'M',
    generation: 2,
    order: 4,
    branchId: 'francesco',
    parents: ['p-giuseppe', 'p-catarina'],
    spouseName: 'Teresa Rossi',
    children: ['p-fra-n1', 'p-fra-n2', 'p-fra-n3', 'p-fra-n4'],
    birthDate: '1886',
    birthPlace: 'Vêneto, Itália',
    deathDate: '1962',
    deathPlace: 'Brasil',
    isLiving: false,
    photo: null,
    bio: 'Quarto filho imigrante. Pioneiro na vitivinicultura e cultivo de parreirais de uva, tradição trazida da Itália.'
  },
  {
    id: 'p-lucia',
    name: 'Lucia Visentin',
    gender: 'F',
    generation: 2,
    order: 5,
    branchId: 'lucia',
    parents: ['p-giuseppe', 'p-catarina'],
    spouseName: 'Luigi Basso',
    children: ['p-luc-n1', 'p-luc-n2', 'p-luc-n3', 'p-luc-n4'],
    birthDate: '1889',
    birthPlace: 'Vêneto, Itália',
    deathDate: '1971',
    deathPlace: 'Brasil',
    isLiving: false,
    photo: null,
    bio: 'A caçula dos 5 filhos que imigraram da Itália. Chegou no colo da mãe Catterina durante a longa travessia do oceano Atlântico.'
  },

  // ==========================================
  // RAMO 1: ANTONIO VISENTIN (G3, G4 com 15 bisnetos, G5, G6)
  // ==========================================
  // G3 - Netos de Antonio
  {
    id: 'p-ant-n1',
    name: 'Pedro Visentin',
    gender: 'M',
    generation: 3,
    branchId: 'antonio',
    parents: ['p-antonio'],
    spouseName: 'Angelina Costa',
    children: ['p-ant-b1', 'p-ant-b2', 'p-ant-b3', 'p-ant-b4'],
    birthDate: '1905',
    birthPlace: 'Brasil',
    deathDate: '1982',
    isLiving: false,
    photo: null,
    bio: 'Neto de Giuseppe e Catterina. Agricultor e patriarca de numerosa família.'
  },
  {
    id: 'p-ant-n2',
    name: 'Luiz Visentin',
    gender: 'M',
    generation: 3,
    branchId: 'antonio',
    parents: ['p-antonio'],
    spouseName: 'Clara Silveira',
    children: ['p-ant-b5', 'p-ant-b6', 'p-ant-b7', 'p-ant-b8'],
    birthDate: '1908',
    birthPlace: 'Brasil',
    deathDate: '1989',
    isLiving: false,
    photo: null
  },
  {
    id: 'p-ant-n3',
    name: 'Catarina Visentin II',
    gender: 'F',
    generation: 3,
    branchId: 'antonio',
    parents: ['p-antonio'],
    spouseName: 'Giacomo Meneghetti',
    children: ['p-ant-b9', 'p-ant-b10', 'p-ant-b11', 'p-ant-b12'],
    birthDate: '1911',
    birthPlace: 'Brasil',
    deathDate: '1995',
    isLiving: false,
    photo: null
  },
  {
    id: 'p-ant-n4',
    name: 'Santo Visentin',
    gender: 'M',
    generation: 3,
    branchId: 'antonio',
    parents: ['p-antonio'],
    spouseName: 'Inês Bortolini',
    children: ['p-ant-b13', 'p-ant-b14', 'p-ant-b15'],
    birthDate: '1915',
    birthPlace: 'Brasil',
    deathDate: '1998',
    isLiving: false,
    photo: null
  },

  // G4 - Bisnetos do Ramo Antonio (15 bisnetos!)
  { id: 'p-ant-b1', name: 'Antonio Visentin Neto', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n1'], spouseName: 'Iracema', children: ['p-ant-t1', 'p-ant-t2'], birthDate: '1930', deathDate: '2010', isLiving: false },
  { id: 'p-ant-b2', name: 'José Visentin', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n1'], spouseName: 'Tereza', children: ['p-ant-t3'], birthDate: '1932', deathDate: '2015', isLiving: false },
  { id: 'p-ant-b3', name: 'Maria Angelina Visentin', gender: 'F', generation: 4, branchId: 'antonio', parents: ['p-ant-n1'], spouseName: 'Paulo', children: [], birthDate: '1935', isLiving: false },
  { id: 'p-ant-b4', name: 'Carlos Visentin', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n1'], spouseName: 'Lourdes', children: [], birthDate: '1938', isLiving: false },
  { id: 'p-ant-b5', name: 'Darcy Visentin', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n2'], spouseName: 'Neiva', children: ['p-ant-t4'], birthDate: '1933', deathDate: '2018', isLiving: false },
  { id: 'p-ant-b6', name: 'Aldo Visentin', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n2'], spouseName: 'Zélia', children: [], birthDate: '1936', isLiving: false },
  { id: 'p-ant-b7', name: 'Zilda Visentin', gender: 'F', generation: 4, branchId: 'antonio', parents: ['p-ant-n2'], spouseName: 'Waldemar', children: [], birthDate: '1939', isLiving: true },
  { id: 'p-ant-b8', name: 'Nelso Visentin', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n2'], spouseName: 'Elza', children: [], birthDate: '1942', isLiving: true },
  { id: 'p-ant-b9', name: 'Mário Meneghetti', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n3'], spouseName: 'Olga', children: [], birthDate: '1934', isLiving: false },
  { id: 'p-ant-b10', name: 'Ivone Meneghetti', gender: 'F', generation: 4, branchId: 'antonio', parents: ['p-ant-n3'], spouseName: 'Roberto', children: [], birthDate: '1937', isLiving: true },
  { id: 'p-ant-b11', name: 'Guerino Meneghetti', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n3'], spouseName: 'Carmem', children: [], birthDate: '1940', isLiving: true },
  { id: 'p-ant-b12', name: 'Lair Meneghetti', gender: 'F', generation: 4, branchId: 'antonio', parents: ['p-ant-n3'], spouseName: 'Jorge', children: [], birthDate: '1943', isLiving: true },
  { id: 'p-ant-b13', name: 'Vilmar Visentin', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n4'], spouseName: 'Solange', children: [], birthDate: '1941', isLiving: true },
  { id: 'p-ant-b14', name: 'Cleusa Visentin', gender: 'F', generation: 4, branchId: 'antonio', parents: ['p-ant-n4'], spouseName: 'Milton', children: [], birthDate: '1944', isLiving: true },
  { id: 'p-ant-b15', name: 'Jaime Visentin', gender: 'M', generation: 4, branchId: 'antonio', parents: ['p-ant-n4'], spouseName: 'Marilene', children: [], birthDate: '1948', isLiving: true },

  // G5 - Trinetos de Antonio
  { id: 'p-ant-t1', name: 'Roberto Visentin', gender: 'M', generation: 5, branchId: 'antonio', parents: ['p-ant-b1'], spouseName: 'Patrícia', children: ['p-ant-tetra1', 'p-ant-tetra2'], birthDate: '1962', isLiving: true },
  { id: 'p-ant-t2', name: 'Luciana Visentin', gender: 'F', generation: 5, branchId: 'antonio', parents: ['p-ant-b1'], spouseName: 'Eduardo', children: [], birthDate: '1965', isLiving: true },
  { id: 'p-ant-t3', name: 'Marcos Visentin', gender: 'M', generation: 5, branchId: 'antonio', parents: ['p-ant-b2'], spouseName: 'Carla', children: [], birthDate: '1968', isLiving: true },
  { id: 'p-ant-t4', name: 'Renata Visentin', gender: 'F', generation: 5, branchId: 'antonio', parents: ['p-ant-b5'], spouseName: 'Felipe', children: [], birthDate: '1970', isLiving: true },

  // G6 - Tetranetos de Antonio (6ª geração!)
  { id: 'p-ant-tetra1', name: 'Lucas Visentin', gender: 'M', generation: 6, branchId: 'antonio', parents: ['p-ant-t1'], children: [], birthDate: '1995', birthPlace: 'Brasil', isLiving: true, bio: 'Tetraneto de Giuseppe e Catterina Visentin.' },
  { id: 'p-ant-tetra2', name: 'Beatriz Visentin', gender: 'F', generation: 6, branchId: 'antonio', parents: ['p-ant-t1'], children: [], birthDate: '2001', birthPlace: 'Brasil', isLiving: true },

  // ==========================================
  // RAMO 2: GIOVANNI VISENTIN (G3, G4 com 15 bisnetos, G5, G6)
  // ==========================================
  // G3 - Netos de Giovanni
  { id: 'p-gio-n1', name: 'Angelo Visentin', gender: 'M', generation: 3, branchId: 'giovanni', parents: ['p-giovanni'], spouseName: 'Amábile', children: ['p-gio-b1', 'p-gio-b2', 'p-gio-b3', 'p-gio-b4'], birthDate: '1907', deathDate: '1984', isLiving: false },
  { id: 'p-gio-n2', name: 'Giuseppe Visentin Sobrinho', gender: 'M', generation: 3, branchId: 'giovanni', parents: ['p-giovanni'], spouseName: 'Vitória', children: ['p-gio-b5', 'p-gio-b6', 'p-gio-b7', 'p-gio-b8'], birthDate: '1910', deathDate: '1987', isLiving: false },
  { id: 'p-gio-n3', name: 'Adelaide Visentin', gender: 'F', generation: 3, branchId: 'giovanni', parents: ['p-giovanni'], spouseName: 'Silvio Fontana', children: ['p-gio-b9', 'p-gio-b10', 'p-gio-b11', 'p-gio-b12'], birthDate: '1913', deathDate: '1996', isLiving: false },
  { id: 'p-gio-n4', name: 'Dante Visentin', gender: 'M', generation: 3, branchId: 'giovanni', parents: ['p-giovanni'], spouseName: 'Lucinda', children: ['p-gio-b13', 'p-gio-b14', 'p-gio-b15'], birthDate: '1917', deathDate: '1999', isLiving: false },

  // G4 - Bisnetos do Ramo Giovanni (15 bisnetos!)
  { id: 'p-gio-b1', name: 'Valdir Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n1'], spouseName: 'Dirce', children: ['p-gio-t1'], birthDate: '1932', deathDate: '2016', isLiving: false },
  { id: 'p-gio-b2', name: 'Osmar Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n1'], spouseName: 'Irene', children: [], birthDate: '1935', isLiving: true },
  { id: 'p-gio-b3', name: 'Lidia Visentin', gender: 'F', generation: 4, branchId: 'giovanni', parents: ['p-gio-n1'], spouseName: 'Vicente', children: [], birthDate: '1937', isLiving: true },
  { id: 'p-gio-b4', name: 'Sérgio Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n1'], spouseName: 'Gladis', children: [], birthDate: '1940', isLiving: true },
  { id: 'p-gio-b5', name: 'Nelson Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n2'], spouseName: 'Nadir', children: [], birthDate: '1934', isLiving: false },
  { id: 'p-gio-b6', name: 'Gelson Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n2'], spouseName: 'Elaine', children: [], birthDate: '1938', isLiving: true },
  { id: 'p-gio-b7', name: 'Vera Visentin', gender: 'F', generation: 4, branchId: 'giovanni', parents: ['p-gio-n2'], spouseName: 'Cid', children: [], birthDate: '1941', isLiving: true },
  { id: 'p-gio-b8', name: 'Enio Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n2'], spouseName: 'Marli', children: [], birthDate: '1945', isLiving: true },
  { id: 'p-gio-b9', name: 'Alcides Fontana', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n3'], spouseName: 'Célia', children: [], birthDate: '1936', isLiving: false },
  { id: 'p-gio-b10', name: 'Elza Fontana', gender: 'F', generation: 4, branchId: 'giovanni', parents: ['p-gio-n3'], spouseName: 'Arlindo', children: [], birthDate: '1939', isLiving: true },
  { id: 'p-gio-b11', name: 'Renato Fontana', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n3'], spouseName: 'Mirian', children: [], birthDate: '1943', isLiving: true },
  { id: 'p-gio-b12', name: 'Clelia Fontana', gender: 'F', generation: 4, branchId: 'giovanni', parents: ['p-gio-n3'], spouseName: 'Odir', children: [], birthDate: '1947', isLiving: true },
  { id: 'p-gio-b13', name: 'Claudio Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n4'], spouseName: 'Vera', children: [], birthDate: '1942', isLiving: true },
  { id: 'p-gio-b14', name: 'Sandra Visentin', gender: 'F', generation: 4, branchId: 'giovanni', parents: ['p-gio-n4'], spouseName: 'Luiz Carlos', children: [], birthDate: '1946', isLiving: true },
  { id: 'p-gio-b15', name: 'Danilo Visentin', gender: 'M', generation: 4, branchId: 'giovanni', parents: ['p-gio-n4'], spouseName: 'Ana Maria', children: [], birthDate: '1950', isLiving: true },

  // G5 & G6 Ramo Giovanni
  { id: 'p-gio-t1', name: 'Rodrigo Visentin', gender: 'M', generation: 5, branchId: 'giovanni', parents: ['p-gio-b1'], spouseName: 'Juliana', children: ['p-gio-tetra1'], birthDate: '1971', isLiving: true },
  { id: 'p-gio-tetra1', name: 'Gabriel Visentin', gender: 'M', generation: 6, branchId: 'giovanni', parents: ['p-gio-t1'], children: [], birthDate: '2004', isLiving: true, bio: 'Estudante, 6ª geração da família Visentin.' },

  // ==========================================
  // RAMO 3: MARIA VISENTIN (G3, G4 com 15 bisnetos, G5, G6)
  // ==========================================
  // G3 - Netos de Maria
  { id: 'p-mar-n1', name: 'Guido Zanella', gender: 'M', generation: 3, branchId: 'maria', parents: ['p-maria'], spouseName: 'Pierina', children: ['p-mar-b1', 'p-mar-b2', 'p-mar-b3', 'p-mar-b4'], birthDate: '1906', deathDate: '1978', isLiving: false },
  { id: 'p-mar-n2', name: 'Olindo Zanella', gender: 'M', generation: 3, branchId: 'maria', parents: ['p-maria'], spouseName: 'Carmela', children: ['p-mar-b5', 'p-mar-b6', 'p-mar-b7', 'p-mar-b8'], birthDate: '1909', deathDate: '1985', isLiving: false },
  { id: 'p-mar-n3', name: 'Ida Zanella', gender: 'F', generation: 3, branchId: 'maria', parents: ['p-maria'], spouseName: 'Severino Pavan', children: ['p-mar-b9', 'p-mar-b10', 'p-mar-b11', 'p-mar-b12'], birthDate: '1912', deathDate: '1993', isLiving: false },
  { id: 'p-mar-n4', name: 'Albina Zanella', gender: 'F', generation: 3, branchId: 'maria', parents: ['p-maria'], spouseName: 'Augusto Furlan', children: ['p-mar-b13', 'p-mar-b14', 'p-mar-b15'], birthDate: '1916', deathDate: '2001', isLiving: false },

  // G4 - Bisnetos do Ramo Maria (15 bisnetos!)
  { id: 'p-mar-b1', name: 'Moacir Zanella', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n1'], spouseName: 'Helena', children: ['p-mar-t1'], birthDate: '1931', deathDate: '2012', isLiving: false },
  { id: 'p-mar-b2', name: 'Nadir Zanella', gender: 'F', generation: 4, branchId: 'maria', parents: ['p-mar-n1'], spouseName: 'Wilson', children: [], birthDate: '1934', isLiving: true },
  { id: 'p-mar-b3', name: 'Alfeu Zanella', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n1'], spouseName: 'Maria José', children: [], birthDate: '1937', isLiving: true },
  { id: 'p-mar-b4', name: 'Lourdes Zanella', gender: 'F', generation: 4, branchId: 'maria', parents: ['p-mar-n1'], spouseName: 'Pedro', children: [], birthDate: '1941', isLiving: true },
  { id: 'p-mar-b5', name: 'Ivaldo Zanella', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n2'], spouseName: 'Ivete', children: [], birthDate: '1935', isLiving: false },
  { id: 'p-mar-b6', name: 'Salete Zanella', gender: 'F', generation: 4, branchId: 'maria', parents: ['p-mar-n2'], spouseName: 'Valmor', children: [], birthDate: '1938', isLiving: true },
  { id: 'p-mar-b7', name: 'Ronaldo Zanella', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n2'], spouseName: 'Clarice', children: [], birthDate: '1942', isLiving: true },
  { id: 'p-mar-b8', name: 'Marilda Zanella', gender: 'F', generation: 4, branchId: 'maria', parents: ['p-mar-n2'], spouseName: 'José', children: [], birthDate: '1946', isLiving: true },
  { id: 'p-mar-b9', name: 'Elio Pavan', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n3'], spouseName: 'Sonia', children: [], birthDate: '1936', isLiving: true },
  { id: 'p-mar-b10', name: 'Sueli Pavan', gender: 'F', generation: 4, branchId: 'maria', parents: ['p-mar-n3'], spouseName: 'Antonio', children: [], birthDate: '1940', isLiving: true },
  { id: 'p-mar-b11', name: 'Dinarte Pavan', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n3'], spouseName: 'Vera', children: [], birthDate: '1944', isLiving: true },
  { id: 'p-mar-b12', name: 'Neusa Pavan', gender: 'F', generation: 4, branchId: 'maria', parents: ['p-mar-n3'], spouseName: 'Mauro', children: [], birthDate: '1948', isLiving: true },
  { id: 'p-mar-b13', name: 'Ivo Furlan', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n4'], spouseName: 'Rosa', children: [], birthDate: '1940', isLiving: true },
  { id: 'p-mar-b14', name: 'Cenira Furlan', gender: 'F', generation: 4, branchId: 'maria', parents: ['p-mar-n4'], spouseName: 'João', children: [], birthDate: '1944', isLiving: true },
  { id: 'p-mar-b15', name: 'Valter Furlan', gender: 'M', generation: 4, branchId: 'maria', parents: ['p-mar-n4'], spouseName: 'Carmen', children: [], birthDate: '1949', isLiving: true },

  // G5 & G6 Ramo Maria
  { id: 'p-mar-t1', name: 'Fabiana Zanella', gender: 'F', generation: 5, branchId: 'maria', parents: ['p-mar-b1'], spouseName: 'Leandro', children: ['p-mar-tetra1'], birthDate: '1974', isLiving: true },
  { id: 'p-mar-tetra1', name: 'Manuela Zanella', gender: 'F', generation: 6, branchId: 'maria', parents: ['p-mar-t1'], children: [], birthDate: '2010', isLiving: true, bio: 'Representante da 6ª geração da linhagem de Maria Visentin.' },

  // ==========================================
  // RAMO 4: FRANCESCO VISENTIN (G3, G4 com 15 bisnetos, G5, G6)
  // ==========================================
  // G3 - Netos de Francesco
  { id: 'p-fra-n1', name: 'Bruno Visentin', gender: 'M', generation: 3, branchId: 'francesco', parents: ['p-francesco'], spouseName: 'Gisela', children: ['p-fra-b1', 'p-fra-b2', 'p-fra-b3', 'p-fra-b4'], birthDate: '1910', deathDate: '1988', isLiving: false },
  { id: 'p-fra-n2', name: 'Silvino Visentin', gender: 'M', generation: 3, branchId: 'francesco', parents: ['p-francesco'], spouseName: 'Olívia', children: ['p-fra-b5', 'p-fra-b6', 'p-fra-b7', 'p-fra-b8'], birthDate: '1914', deathDate: '1991', isLiving: false },
  { id: 'p-fra-n3', name: 'Amélia Visentin', gender: 'F', generation: 3, branchId: 'francesco', parents: ['p-francesco'], spouseName: 'Emílio Dal Molin', children: ['p-fra-b9', 'p-fra-b10', 'p-fra-b11', 'p-fra-b12'], birthDate: '1918', deathDate: '2004', isLiving: false },
  { id: 'p-fra-n4', name: 'Otávio Visentin', gender: 'M', generation: 3, branchId: 'francesco', parents: ['p-francesco'], spouseName: 'Irma', children: ['p-fra-b13', 'p-fra-b14', 'p-fra-b15'], birthDate: '1921', deathDate: '2006', isLiving: false },

  // G4 - Bisnetos do Ramo Francesco (15 bisnetos!)
  { id: 'p-fra-b1', name: 'Ademir Visentin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n1'], spouseName: 'Zenaide', children: ['p-fra-t1'], birthDate: '1935', deathDate: '2019', isLiving: false },
  { id: 'p-fra-b2', name: 'Ilse Visentin', gender: 'F', generation: 4, branchId: 'francesco', parents: ['p-fra-n1'], spouseName: 'Alcides', children: [], birthDate: '1938', isLiving: true },
  { id: 'p-fra-b3', name: 'Itamar Visentin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n1'], spouseName: 'Marilda', children: [], birthDate: '1942', isLiving: true },
  { id: 'p-fra-b4', name: 'Nadir Visentin', gender: 'F', generation: 4, branchId: 'francesco', parents: ['p-fra-n1'], spouseName: 'Gilberto', children: [], birthDate: '1945', isLiving: true },
  { id: 'p-fra-b5', name: 'Gilmar Visentin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n2'], spouseName: 'Cleonice', children: [], birthDate: '1939', isLiving: true },
  { id: 'p-fra-b6', name: 'Sirlei Visentin', gender: 'F', generation: 4, branchId: 'francesco', parents: ['p-fra-n2'], spouseName: 'Ary', children: [], birthDate: '1943', isLiving: true },
  { id: 'p-fra-b7', name: 'Romeu Visentin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n2'], spouseName: 'Eliana', children: [], birthDate: '1947', isLiving: true },
  { id: 'p-fra-b8', name: 'Marlene Visentin', gender: 'F', generation: 4, branchId: 'francesco', parents: ['p-fra-n2'], spouseName: 'Rubens', children: [], birthDate: '1951', isLiving: true },
  { id: 'p-fra-b9', name: 'Dorval Dal Molin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n3'], spouseName: 'Ivania', children: [], birthDate: '1941', isLiving: true },
  { id: 'p-fra-b10', name: 'Lorena Dal Molin', gender: 'F', generation: 4, branchId: 'francesco', parents: ['p-fra-n3'], spouseName: 'Renê', children: [], birthDate: '1945', isLiving: true },
  { id: 'p-fra-b11', name: 'Sérgio Dal Molin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n3'], spouseName: 'Angela', children: [], birthDate: '1949', isLiving: true },
  { id: 'p-fra-b12', name: 'Vanderlei Dal Molin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n3'], spouseName: 'Solange', children: [], birthDate: '1953', isLiving: true },
  { id: 'p-fra-b13', name: 'Edson Visentin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n4'], spouseName: 'Rosaura', children: [], birthDate: '1946', isLiving: true },
  { id: 'p-fra-b14', name: 'Elizabete Visentin', gender: 'F', generation: 4, branchId: 'francesco', parents: ['p-fra-n4'], spouseName: 'Nelson', children: [], birthDate: '1950', isLiving: true },
  { id: 'p-fra-b15', name: 'Marcos Otávio Visentin', gender: 'M', generation: 4, branchId: 'francesco', parents: ['p-fra-n4'], spouseName: 'Luciane', children: [], birthDate: '1955', isLiving: true },

  // G5 & G6 Ramo Francesco
  { id: 'p-fra-t1', name: 'Gustavo Visentin', gender: 'M', generation: 5, branchId: 'francesco', parents: ['p-fra-b1'], spouseName: 'Mariana', children: ['p-fra-tetra1'], birthDate: '1976', isLiving: true },
  { id: 'p-fra-tetra1', name: 'Enzo Visentin', gender: 'M', generation: 6, branchId: 'francesco', parents: ['p-fra-t1'], children: [], birthDate: '2015', isLiving: true, bio: 'Tetraneto, nome clássico italiano honrando os antepassados.' },

  // ==========================================
  // RAMO 5: LUCIA VISENTIN (G3, G4 com 15 bisnetos, G5, G6)
  // ==========================================
  // G3 - Netos de Lucia
  { id: 'p-luc-n1', name: 'Severo Basso', gender: 'M', generation: 3, branchId: 'lucia', parents: ['p-lucia'], spouseName: 'Ermelinda', children: ['p-luc-b1', 'p-luc-b2', 'p-luc-b3', 'p-luc-b4'], birthDate: '1912', deathDate: '1989', isLiving: false },
  { id: 'p-luc-n2', name: 'Mario Basso', gender: 'M', generation: 3, branchId: 'lucia', parents: ['p-lucia'], spouseName: 'Dileta', children: ['p-luc-b5', 'p-luc-b6', 'p-luc-b7', 'p-luc-b8'], birthDate: '1915', deathDate: '1992', isLiving: false },
  { id: 'p-luc-n3', name: 'Theresa Basso', gender: 'F', generation: 3, branchId: 'lucia', parents: ['p-lucia'], spouseName: 'Alcides Bortoluzzi', children: ['p-luc-b9', 'p-luc-b10', 'p-luc-b11', 'p-luc-b12'], birthDate: '1919', deathDate: '2003', isLiving: false },
  { id: 'p-luc-n4', name: 'Lauro Basso', gender: 'M', generation: 3, branchId: 'lucia', parents: ['p-lucia'], spouseName: 'Catarina Basso', children: ['p-luc-b13', 'p-luc-b14', 'p-luc-b15'], birthDate: '1923', deathDate: '2008', isLiving: false },

  // G4 - Bisnetos do Ramo Lucia (15 bisnetos!)
  { id: 'p-luc-b1', name: 'Vilson Basso', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n1'], spouseName: 'Ivone', children: ['p-luc-t1'], birthDate: '1937', isLiving: true },
  { id: 'p-luc-b2', name: 'Cladir Basso', gender: 'F', generation: 4, branchId: 'lucia', parents: ['p-luc-n1'], spouseName: 'Osvaldo', children: [], birthDate: '1940', isLiving: true },
  { id: 'p-luc-b3', name: 'Valdemar Basso', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n1'], spouseName: 'Terezinha', children: [], birthDate: '1944', isLiving: true },
  { id: 'p-luc-b4', name: 'Leda Basso', gender: 'F', generation: 4, branchId: 'lucia', parents: ['p-luc-n1'], spouseName: 'Almir', children: [], birthDate: '1947', isLiving: true },
  { id: 'p-luc-b5', name: 'Airton Basso', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n2'], spouseName: 'Mariza', children: [], birthDate: '1941', isLiving: true },
  { id: 'p-luc-b6', name: 'Marilene Basso', gender: 'F', generation: 4, branchId: 'lucia', parents: ['p-luc-n2'], spouseName: 'Clóvis', children: [], birthDate: '1945', isLiving: true },
  { id: 'p-luc-b7', name: 'Gilberto Basso', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n2'], spouseName: 'Leonor', children: [], birthDate: '1949', isLiving: true },
  { id: 'p-luc-b8', name: 'Rosane Basso', gender: 'F', generation: 4, branchId: 'lucia', parents: ['p-luc-n2'], spouseName: 'Walter', children: [], birthDate: '1953', isLiving: true },
  { id: 'p-luc-b9', name: 'Moacyr Bortoluzzi', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n3'], spouseName: 'Vera Lúcia', children: [], birthDate: '1943', isLiving: true },
  { id: 'p-luc-b10', name: 'Sueli Bortoluzzi', gender: 'F', generation: 4, branchId: 'lucia', parents: ['p-luc-n3'], spouseName: 'Edemar', children: [], birthDate: '1947', isLiving: true },
  { id: 'p-luc-b11', name: 'César Bortoluzzi', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n3'], spouseName: 'Rosângela', children: [], birthDate: '1951', isLiving: true },
  { id: 'p-luc-b12', name: 'Jussara Bortoluzzi', gender: 'F', generation: 4, branchId: 'lucia', parents: ['p-luc-n3'], spouseName: 'Carlos Alberto', children: [], birthDate: '1955', isLiving: true },
  { id: 'p-luc-b13', name: 'Luiz Basso', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n4'], spouseName: 'Ana Cláudia', children: [], birthDate: '1948', isLiving: true },
  { id: 'p-luc-b14', name: 'Maria Lúcia Basso', gender: 'F', generation: 4, branchId: 'lucia', parents: ['p-luc-n4'], spouseName: 'Fernando', children: [], birthDate: '1952', isLiving: true },
  { id: 'p-luc-b15', name: 'Paulo Roberto Basso', gender: 'M', generation: 4, branchId: 'lucia', parents: ['p-luc-n4'], spouseName: 'Márcia', children: [], birthDate: '1957', isLiving: true },

  // G5 & G6 Ramo Lucia
  { id: 'p-luc-t1', name: 'Alexandre Basso', gender: 'M', generation: 5, branchId: 'lucia', parents: ['p-luc-b1'], spouseName: 'Camila', children: ['p-luc-tetra1'], birthDate: '1979', isLiving: true },
  { id: 'p-luc-tetra1', name: 'Sophia Basso', gender: 'F', generation: 6, branchId: 'lucia', parents: ['p-luc-t1'], children: [], birthDate: '2018', isLiving: true, bio: 'A mais jovem da 6ª geração da linhagem de Lucia Visentin.' }
];
