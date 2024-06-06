import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Overall Turnover',
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Average',
      data: [3000,4000,5000,6000,7000,6500,5500],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Report Data',
      data: [1000,2000,6000,3500,5500,4500,3800],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};



const OurChat = () => {
  return (
    <Bar options={options} data={data} />
  )
}

export default OurChat