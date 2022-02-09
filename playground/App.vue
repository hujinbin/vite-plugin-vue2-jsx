<template>
    <TableLayout class="task" @keyup.enter.native="refreshTable">
        <sa-form :inline="true" size="small">
            <sa-form-item>
                <sa-input
                    placeholder="输入任务名"
                    v-model="query.name"
                    style="width: 320px"
                >
                    <sa-button
                        square
                        @click="refreshTable"
                        slot="appendButton"
                        icon="sa-icon-search"
                    ></sa-button>
                </sa-input>
            </sa-form-item>
            <sa-form-item label="安装时间">
                <sa-date-picker
                    v-model="time"
                    type="datetimerange"
                    @change="changeTime"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                >
                </sa-date-picker>
            </sa-form-item>
        </sa-form>
        <table-list
            v-loading="loading"
            ref="tableList"
            :columns="columns"
            :data="pageList.list"
            :have-pagination="false"
            empty-text="暂无数据"
        />
    </TableLayout>
</template>

<script>
export default {
    data() {
        return {
            loading: false,
            query: {
                name: '', //应用名称
                serviceStatus: '', //部署状态
                type: '', //应用类型
                clusterId: '', //集群类型
                startTime: '',
                endTime: '',
            },
            pageList: {
                list: [],
                pageInfo: {
                    currentPage: 1,
                    pageSize: 10000,
                    totalCount: 1,
                    totalPage: 20,
                },
            },
            time: '',
            versionList: [],
            appId: '',
        };
    },
    created() {
        // 获取筛选条件
        this.getAppParam();
        this.refreshTable();
    },
    computed: {
        columns() {
            const columns = [
                {
                    prop: 'name',
                    label: '任务名',
                },
                {
                    prop: 'deployTime',
                    label: '安装时间',
                    formatter: row => <span>{row.deployTime}</span>,
                },
                {
                    prop: 'description',
                    label: '描述',
                },
                {
                    prop: 'deployName',
                    label: '安装内容',
                },
                {
                    label: '操作',
                    width: 80,
                    formatter: row => (
                        <div class="action">
                   <sa-button onClick={() => this.goDetail(row)} type="text">查看详情</sa-button>
               </div>),
                },
            ];
            return columns;
        },
    },
    methods: {
        // 加载数据
        refreshTable() {
            this.loading = true;
            this.pageList.list = [];
        },
        changeTime() {
            if (this.time instanceof Array) {
                this.query.startTime = this.time[0];
                this.query.endTime = this.time[1];
            } else {
                this.query.startTime = '';
                this.query.endTime = '';
            }
            this.refreshTable();
        },
        // 查看详情
        goDetail(row) {
            this.CHECK_TASK({ payload: row });
            this.$router.push({ name: 'taskDetial', query: { projectId: row.projectId, appId: row.appId, type: 'task' } });
        },
    },
};
</script>
