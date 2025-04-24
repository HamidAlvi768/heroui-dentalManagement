import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

export function PatientMap() {
  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <div className="bg-white p-1 rounded shadow">
          <Icon icon="lucide:plus" width={16} />
        </div>
        <div className="bg-white p-1 rounded shadow">
          <Icon icon="lucide:minus" width={16} />
        </div>
      </div>
      
      <div className="h-[200px] bg-gray-100 rounded-lg relative overflow-hidden">
        <img 
          src="https://img.heroui.chat/image/places?w=600&h=300&u=1" 
          alt="World map" 
          className="w-full h-full object-cover opacity-50"
        />
        
        {/* Map markers */}
        <div className="absolute top-[30%] left-[20%]">
          <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-primary rounded-full absolute top-0"></div>
        </div>
        
        <div className="absolute top-[40%] left-[30%]">
          <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-primary rounded-full absolute top-0"></div>
        </div>
        
        <div className="absolute top-[35%] left-[80%]">
          <div className="w-3 h-3 bg-warning rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-warning rounded-full absolute top-0"></div>
        </div>
        
        <div className="absolute top-[60%] left-[70%]">
          <div className="w-3 h-3 bg-warning rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-warning rounded-full absolute top-0"></div>
        </div>
      </div>
    </div>
  );
}
