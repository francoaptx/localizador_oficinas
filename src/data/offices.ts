export interface Office {
  id: string;
  name: string;
  address: string;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  // hours: {
  //   monday: string;
  //   tuesday: string;
  //   wednesday: string;
  //   thursday: string;
  //   friday: string;
  //   saturday: string;
  //   sunday: string;
  // };
  services: string[];
  type: 'sucursal' | 'agencia' | 'punto_atencion' | 'oficina_central';
  description?: string;
  image?: string;
}

export const bolivianOffices: Office[] = [
  // La Paz
  {
    id: '1',
    name: 'Directorio',
    address: 'Calle Aniceto Solarez Nº 64',
    city: 'Sucre',
    department: 'DAF',
    latitude: -19.0376,
    longitude: -65.2581,
    phone: '64-45469',
    services: [],
    type: "sucursal",
    description: 'Edificio Dirección Administrativa Y Financiera'
  },

  {
    id: '2',
    name: 'Sucursal Sopocachi',
    address: 'Av. 20 de Octubre 2463',
    city: 'La Paz',
    department: 'La Paz',
    latitude: -16.5069,
    longitude: -68.1310,
    phone: '+591 2 2442567',
    services: ['Atención al Cliente', 'Consultas', 'Pagos'],
    type: 'sucursal'
  },
  {
    id: '3',
    name: 'Agencia El Alto',
    address: 'Av. Juan Pablo II, Ciudad Satélite',
    city: 'El Alto',
    department: 'La Paz',
    latitude: -16.5040,
    longitude: -68.1640,
    phone: '+591 2 2843456',
    services: ['Atención al Cliente', 'Trámites Básicos', 'Pagos'],
    type: 'agencia'
  },
  
  // Santa Cruz
  {
    id: '4',
    name: 'Oficina Regional Santa Cruz',
    address: 'Av. San Martín 123, Equipetrol',
    city: 'Santa Cruz de la Sierra',
    department: 'Santa Cruz',
    latitude: -17.7833,
    longitude: -63.1821,
    phone: '+591 3 3345678',
    email: 'santacruz@empresa.bo',
    services: ['Atención al Cliente', 'Trámites Administrativos', 'Consultas', 'Pagos', 'Información General'],
    type: 'oficina_central',
    description: 'Oficina regional para el oriente boliviano'
  },
  {
    id: '5',
    name: 'Sucursal Plan 3000',
    address: 'Av. Santos Dumont, Plan 3000',
    city: 'Santa Cruz de la Sierra',
    department: 'Santa Cruz',
    latitude: -17.7539,
    longitude: -63.1656,
    phone: '+591 3 3567890',
    services: ['Atención al Cliente', 'Consultas', 'Pagos'],
    type: 'sucursal'
  },
  
  // Cochabamba
  {
    id: '6',
    name: 'Oficina Regional Cochabamba',
    address: 'Av. Heroínas 456, Centro',
    city: 'Cochabamba',
    department: 'Cochabamba',
    latitude: -17.3895,
    longitude: -66.1568,
    phone: '+591 4 4234567',
    email: 'cochabamba@empresa.bo',
    services: ['Atención al Cliente', 'Trámites Administrativos', 'Consultas', 'Pagos'],
    type: 'oficina_central'
  },
  {
    id: '7',
    name: 'Punto de Atención Quillacollo',
    address: 'Plaza Principal, Quillacollo',
    city: 'Quillacollo',
    department: 'Cochabamba',
    latitude: -17.3922,
    longitude: -66.2781,
    phone: '+591 4 4345678',
    services: ['Consultas', 'Información General'],
    type: 'punto_atencion'
  },
  
  // Sucre
  {
    id: '8',
    name: 'Oficina Sucre',
    address: 'Calle Estudiantes 789, Centro Histórico',
    city: 'Sucre',
    department: 'Chuquisaca',
    latitude: -19.0196,
    longitude: -65.2619,
    phone: '+591 4 6456789',
    services: ['Atención al Cliente', 'Trámites Básicos', 'Consultas'],
    type: 'sucursal'
  },
  
  // Potosí
  {
    id: '9',
    name: 'Agencia Potosí',
    address: 'Calle Bolívar 321, Centro',
    city: 'Potosí',
    department: 'Potosí',
    latitude: -19.5723,
    longitude: -65.7550,
    phone: '+591 2 6234567',
    services: ['Atención al Cliente', 'Consultas', 'Pagos'],
    type: 'agencia'
  },
  
  // Oruro
  {
    id: '10',
    name: 'Sucursal Oruro',
    address: 'Av. 6 de Agosto 654',
    city: 'Oruro',
    department: 'Oruro',
    latitude: -17.9647,
    longitude: -67.1069,
    phone: '+591 2 5345678',
    services: ['Atención al Cliente', 'Trámites Básicos', 'Consultas'],
    type: 'sucursal'
  },
  
  // Tarija
  {
    id: '11',
    name: 'Oficina Tarija',
    address: 'Calle Ingavi 987, Centro',
    city: 'Tarija',
    department: 'Tarija',
    latitude: -21.5355,
    longitude: -64.7296,
    phone: '+591 4 6567890',
    services: ['Atención al Cliente', 'Trámites Administrativos', 'Consultas', 'Pagos'],
    type: 'sucursal'
  },
  
  // Trinidad (Beni)
  {
    id: '12',
    name: 'Punto de Atención Trinidad',
    address: 'Plaza José Ballivián, Trinidad',
    city: 'Trinidad',
    department: 'Beni',
    latitude: -14.8336,
    longitude: -64.8999,
    phone: '+591 3 4623456',
    services: ['Consultas', 'Información General'],
    type: 'punto_atencion'
  },
  
  // Cobija (Pando)
  {
    id: '13',
    name: 'Punto de Atención Cobija',
    address: 'Av. Internacional, Cobija',
    city: 'Cobija',
    department: 'Pando',
    latitude: -11.0267,
    longitude: -68.7692,
    phone: '+591 3 8423456',
    services: ['Consultas', 'Información General'],
    type: 'punto_atencion'
  }
];

export const officeTypes = {
  oficina_central: 'Oficina Central',
  sucursal: 'Sucursal',
  agencia: 'Agencia',
  punto_atencion: 'Punto de Atención'
};

export const allServices = [
  'Atención al Cliente',
  'Trámites Administrativos',
  'Consultas',
  'Pagos',
  'Información General',
  'Trámites Básicos'
];

export const bolivianDepartments = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Chuquisaca',
  'Potosí',
  'Oruro',
  'Tarija',
  'Beni',
  'Pando'
];