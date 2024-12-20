import * as echarts from 'echarts';
import { FactMap } from './map';
import { ConstantsFunctions } from '../constants/functions';
export const FactsChart = {
    toggle: (show: boolean) => {
        if (show) {
            FactsChart.chart1();
            window.addEventListener('resize', () => {
                echarts.getInstanceByDom(document.getElementById(`chart-1`) as HTMLElement)?.resize();
            });
        } else {
            echarts.getInstanceByDom(document.getElementById(`chart-1`) as HTMLElement)?.clear();
            ConstantsFunctions.emptyHTMLByID('chart-title-1');
            ConstantsFunctions.emptyHTMLByID('chart-subtitle-1');
            ConstantsFunctions.emptyHTMLByID('chart-select-1');
        }
    },

    chart1: () => {
        //TODO type breakdown object.
        const breakdown = FactMap.getTagLine();

        if (breakdown.length) {
            const chart = document.getElementById(`chart-1`);
            const myChart = echarts.init(chart);
            const createGraph = (input = 0) => {
                const chosenFact: {
                    name: string,
                    data: Array<{
                        periodDates: Array<string>,
                        value: number
                    }>
                } = Object.assign({}, breakdown[input]);
                ConstantsFunctions.emptyHTMLByID('chart-title-1');
                ConstantsFunctions.emptyHTMLByID('chart-subtitle-1');
                const chartTitle = document.createTextNode(chosenFact.name.split(':')[1].replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
                    .replace(/^./, (str: string) => { return str.toUpperCase() }));
                document.getElementById('chart-title-1')?.append(chartTitle);

                const chartSubTitle = document.createTextNode(chosenFact.name);
                document.getElementById('chart-subtitle-1')?.append(chartSubTitle);
                const data = new Set();
                chosenFact.data = chosenFact.data.reduce((accumulator: Array<{periodDates: any, value: any}>, current, index) => {
                    if (current.periodDates) {
                        if (current.periodDates.length === 1) {
                            accumulator[index] = { periodDates: current.periodDates[0], value: current.value };
                        } else {
                            accumulator = accumulator.concat(current.periodDates.map((currentNested) => {
                                return { periodDates: currentNested, value: current.value };
                            }));
                        }
                    }
                    return accumulator;
                }, []).filter((element) => {
                    if (data.has(element.periodDates)) {
                        return false;
                    }
                    data.add(element.periodDates);
                    return true;
                }).sort((first: { periodDates: string | number | Date; }, second: { periodDates: string | number | Date; }) => {
                    return new Date(first.periodDates) - new Date(second.periodDates);
                });

                const option = {

                    tooltip: {
                        trigger: 'item',
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left'
                    },
                    xAxis: {
                        type: 'category',
                        data: chosenFact.data.map((current) => {
                            return current.periodDates
                        }),
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            type: 'line',
                            smooth: true,
                            data: chosenFact.data.map((current) => { return current.value }),
                        }
                    ]
                };
                myChart.setOption(option, true);
            };

            const select = document.createElement('select');
            select.classList.add('form-select');
            select.classList.add('mx-2');

            breakdown.forEach((current: any, index) => {
                const option = document.createElement('option');
                if (index === 0) {
                    option.setAttribute('selected', 'true');
                }
                option.setAttribute('value', String(index));
                const optionText = document.createTextNode(`${index + 1}: ${current.name.split(':')[1].replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
                    .replace(/^./, (str: string) => { return str.toUpperCase() })}`);
                option.append(optionText);
                select.append(option);
            });

            document.getElementById('chart-select-1')?.append(select);

            //TODO event.target.value used in multiple places, has to be better fix...
            select.addEventListener('change', (event) => {
                createGraph(event?.target?.value as number);
            });

            createGraph();
        }
    }
};