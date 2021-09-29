import { render } from 'react-dom';
import './index.css';
import * as React from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  InfiniteScroll,
  Filter,
  Toolbar,
  Sort,
  Search,
  Inject
} from '@syncfusion/ej2-react-grids';
import { SampleBase } from './sample-base';
import { Ajax } from '@syncfusion/ej2-base';
export class CustomBinding extends SampleBase {
  constructor() {
    super(...arguments);
    this.orderService = new OrderService();
  }
  rendereComplete() {
    let state = { skip: 0, take: 150 };
    this.dataStateChange(state);
  }
  dataStateChange(state) {
    state.pageSize = this.grid.pageSettings.pageSize;
    if (
      state.action &&
      (state.action.requestType == 'filterchoicerequest' ||
        state.action.requestType == 'filtersearchbegin' ||
        state.action.requestType == 'stringfilterrequest')
    ) {
      this.orderService.execute(state).then(gridData => {
        state.dataSource(gridData.result);
      });
    } else {
      this.orderService.execute(state).then(gridData => {
        this.grid.dataSource = gridData;
      });
    }
  }
  render() {
    return (
      <div className="control-pane">
        <div className="control-section">
          <GridComponent
            dataSource={this.data}
            ref={g => (this.grid = g)}
            allowSorting={true}
            toolbar={['Search']}
            enableInfiniteScrolling={true}
            pageSettings={{ pageSize: 50 }}
            dataStateChange={this.dataStateChange.bind(this)}
            height={300}
          >
            <ColumnsDirective>
              <ColumnDirective
                field="OrderID"
                headerText="Order ID"
                width="120"
              />
              <ColumnDirective
                field="EmployeeID"
                headerText="Customer Name"
                width="150"
              />
            </ColumnsDirective>
            <Inject services={[InfiniteScroll, Sort, Toolbar, Search]} />
          </GridComponent>
        </div>
      </div>
    );
  }
}
export class OrderService {
  constructor() {
    this.ajax = new Ajax({
      type: 'GET',
      mode: true,
      onFailure: e => {
        return false;
      }
    });
    this.BASE_URL =
      'https://js.syncfusion.com/demos/ejServices/Wcf/Northwind.svc/Orders';
  }
  execute(state) {
    return this.getData(state);
  }
  getData(state) {
    const pageQuery = `$skip=${state.skip}&$top=${state.take}`;
    let sortQuery = '';
    let filterQuery = '';
    let skip = state.skip ? state.skip : 0;
    let take = state.take;
    if ((state.sorted || []).length) {
      sortQuery =
        `&$orderby=` +
        state.sorted
          .map(obj => {
            return obj.direction === 'descending'
              ? `${obj.name} desc`
              : obj.name;
          })
          .reverse()
          .join(',');
    }
    if (state.where) {
      debugger;
      filterQuery =
        `&$filter=` +
        state.where.map(obj => {
          return obj.predicates
            .map(predicate => {
              debugger;
              return predicate.operator === 'equal'
                ? `${predicate.field} eq ${predicate.value}`
                : `${predicate.operator}(tolower(${predicate.field}),'${
                    predicate.value
                  }')`;
            })
            .reverse()
            .join(' and ');
        });
    }

    this.ajax.url = `${
      this.BASE_URL
    }?${sortQuery}&$inlinecount=allpages&$format=json`;
    return this.ajax.send().then(response => {
      let data = JSON.parse(response);
      return {
        result: data['d']['results'].slice(skip, skip + take),
        count: parseInt(data['d']['__count'], 10)
      };
    });
  }
}

render(<CustomBinding />, document.getElementById('sample'));
