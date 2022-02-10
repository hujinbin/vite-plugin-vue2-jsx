<template>
    <div :columns="columns">
        {{columns}}
    </div>
</template>

<script>
export default {
    data() {
        return {
        };
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
        // 查看详情
        goDetail(row) {
            console.log(row)
        },
    },
};
</script>
