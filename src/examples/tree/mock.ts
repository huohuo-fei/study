export const testData = {
  level: 1, // 第一回合
  title: '1', // 显示的内容
  star: 99, // 星星数量
  children: [
    {
      level: 2,
      title: '2',
      star: 12,
      children: [
        {
          level: 3,
          title: '3-1',
          star: 6,
          children: [
            {
              level: 4,
              title: '4',
              star: 12,
              children: [],
            },
          ],
        },
        {
          level: 3,
          title: '3-2',
          star: 8,
          children: [
            {
              level: 4,
              title: '4',
              star: 4,
              children: [
                {
                  level: 5,
                  title: '5',
                  star: 3,
                  children: [
                    {
                      level: 6,
                      title: '6',
                      star: 7,
                      children: [
                        {
                          level: 7,
                          title: '7-2',
                          star: 24,
                          children: [
                            {
                              level: 8,
                              title: '8',
                              star: 2,
                              children: [],
                            },
                          ],
                        },
                        {
                          level: 7,
                          title: '7-1',
                          star: 10,
                          children: [
                            {
                              level: 8,
                              title: '8-5',
                              star: 6,
                              children: [],
                            },
                            {
                              level: 8,
                              title: '8-4',
                              star: 5,
                              children: [
                                {
                                  level: 9,
                                  title: '9',
                                  star: 24,
                                  children: [],
                                },
                              ],
                            },
                            {
                              level: 8,
                              title: '8-3',
                              star: 12,
                              children: [
                                {
                                  level: 9,
                                  title: '9',
                                  star: 12,
                                  children: [],
                                },
                              ],
                            },
                            {
                              level: 8,
                              title: '8-2',
                              star: 7,
                              children: [],
                            },
                            {
                              level: 8,
                              title: '8-1',
                              star: 4,
                              children: [
                                {
                                  level: 9,
                                  title: '9',
                                  star: 15,
                                  children: [
                                    {
                                      level: 10,
                                      title: '10',
                                      star: 13,
                                      children: [],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
