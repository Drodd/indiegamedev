// 游戏状态
let gameState = {
    money: 500, // 资金（万元）
    maxMoney: 500, // 历史最大资金
    progress: 0, // 开发进度（%）
    month: 6, // 当前月份
    year: 2025, // 当前年份
    teamConfidence: {
        artist: 60, // 美术信心
        programmer: 60, // 程序信心
        designer: 60 // 策划信心
    },
    teamMembers: {
        artist: true, // 美术是否在团队中
        programmer: true, // 程序是否在团队中
        designer: true // 策划是否在团队中
    },
    isInDebtMode: false, // 是否在负债模式
    isGameOver: false,
    currentEvent: null,
    isIntroShown: true // 是否显示介绍页面
};

// 角色管理配置
const characterConfig = {
    designer: {
        element: 'char-designer',
        wrapperElement: 'char-designer',
        labelElement: 'char-designer-label',
        bubbleElement: 'char-designer-bubble',
        imagePath: 'img/img_char1_',
        name: '策划',
        positions: ['left', 'center'] // 可能的显示位置
    },
    programmer: {
        element: 'char-programmer', 
        wrapperElement: 'char-programmer',
        labelElement: 'char-programmer-label',
        bubbleElement: 'char-programmer-bubble',
        imagePath: 'img/img_char3_',
        name: '程序',
        positions: ['center']
    },
    artist: {
        element: 'char-artist',
        wrapperElement: 'char-artist',
        labelElement: 'char-artist-label',
        bubbleElement: 'char-artist-bubble',
        imagePath: 'img/img_char2_',
        name: '美术',
        positions: ['right', 'center']
    }
};

// 根据信心值获取情绪状态
function getEmotionFromConfidence(confidence) {
    if (confidence >= 45) return 'happy';
    if (confidence >= 20) return 'doubt';
    return 'sad';
}

// 根据信心值获取状态文字和样式
function getStatusFromConfidence(confidence) {
    if (confidence >= 45) return { text: '信心十足', class: 'status-high' };
    if (confidence >= 20) return { text: '有点怀疑', class: 'status-medium' };
    if (confidence >= 0) return { text: '爱不起来', class: 'status-low' };
    return { text: '信心不足', class: 'status-low' };
}

// 根据信心变化获取角色对话内容
function getConfidenceChangeDialogue(confidenceChange) {
    if (confidenceChange > 15) {
        return "真不错！";
    } else if (confidenceChange > 5) {
        return "真不错！";
    } else if (confidenceChange > 0) {
        return "真不错！";
    } else if (confidenceChange > -5) {
        return "...";
    } else if (confidenceChange > -15) {
        return "...";
    } else {
        return "...";
    }
}

// 显示角色对话气泡
function showCharacterBubbles(effects) {
    const bubblePromises = [];
    
    // 遍历所有角色，显示有信心变化的角色的对话气泡
    Object.keys(characterConfig).forEach(member => {
        const effect = effects[member];
        if (effect && gameState.teamMembers[member]) {
            const config = characterConfig[member];
            const bubbleElement = document.getElementById(config.bubbleElement);
            const dialogue = getConfidenceChangeDialogue(effect);
            
            bubbleElement.textContent = dialogue;
            bubbleElement.classList.add('show');
            
            // 2秒后隐藏气泡
            const hidePromise = new Promise((resolve) => {
                setTimeout(() => {
                    bubbleElement.classList.remove('show');
                    setTimeout(() => {
                        bubbleElement.textContent = '';
                        resolve();
                    }, 300); // 等待淡出动画完成
                }, 2000);
            });
            
            bubblePromises.push(hidePromise);
        }
    });
    
    return Promise.all(bubblePromises);
}

// 更新角色显示
function updateCharacterDisplay() {
    console.log('=== 更新角色显示 ===');
    
    // 获取当前在团队中的成员
    const activeMembers = Object.keys(gameState.teamMembers).filter(member => gameState.teamMembers[member]);
    console.log('当前团队成员:', activeMembers);
    
    // 隐藏所有角色
    Object.keys(characterConfig).forEach(member => {
        const element = document.getElementById(characterConfig[member].element);
        const labelElement = document.getElementById(characterConfig[member].labelElement);
        const wrapper = element.parentElement;
        
        wrapper.classList.add('hidden');
        wrapper.classList.remove('position-left', 'position-center', 'position-right');
        element.classList.add('hidden');
        labelElement.classList.add('hidden');
    });
    
    // 根据团队成员数量确定显示方案
    if (activeMembers.length === 3) {
        // 3人：策划左侧，程序中间，美术右侧
        updateSingleCharacter('designer', 'left');
        updateSingleCharacter('programmer', 'center');
        updateSingleCharacter('artist', 'right');
    } else if (activeMembers.length === 2) {
        // 2人：中间位置不显示，剩余角色分布在左右
        const positions = ['left', 'right'];
        activeMembers.forEach((member, index) => {
            updateSingleCharacter(member, positions[index]);
        });
    } else if (activeMembers.length === 1) {
        // 1人：显示在中间
        updateSingleCharacter(activeMembers[0], 'center');
    }
    
    console.log('角色显示更新完成');
    console.log('===================');
}

// 更新单个角色显示
function updateSingleCharacter(member, position) {
    const config = characterConfig[member];
    const element = document.getElementById(config.element);
    const labelElement = document.getElementById(config.labelElement);
    const wrapper = element.parentElement;
    const confidence = gameState.teamConfidence[member];
    const emotion = getEmotionFromConfidence(confidence);
    const status = getStatusFromConfidence(confidence);
    
    // 设置图片路径
    element.src = config.imagePath + emotion + '.png';
    
    // 更新标签内容
    const statusElement = labelElement.querySelector('.character-status');
    statusElement.textContent = status.text;
    statusElement.className = 'character-status ' + status.class;
    
    // 设置位置
    wrapper.classList.add('position-' + position);
    
    // 显示角色和标签
    wrapper.classList.remove('hidden');
    element.classList.remove('hidden');
    labelElement.classList.remove('hidden');
    
    console.log(`${member} 显示在 ${position} 位置，情绪: ${emotion}，状态: ${status.text}`);
}

// 仅更新角色图像
function updateCharacterImages() {
    console.log('=== 更新角色图像 ===');
    
    Object.keys(characterConfig).forEach(member => {
        if (gameState.teamMembers[member]) {
            const config = characterConfig[member];
            const element = document.getElementById(config.element);
            const labelElement = document.getElementById(config.labelElement);
            const confidence = gameState.teamConfidence[member];
            const emotion = getEmotionFromConfidence(confidence);
            const status = getStatusFromConfidence(confidence);
            
            // 设置图片路径
            element.src = config.imagePath + emotion + '.png';
            
            // 更新标签内容
            const statusElement = labelElement.querySelector('.character-status');
            statusElement.textContent = status.text;
            statusElement.className = 'character-status ' + status.class;
            
            console.log(`${member} 图像更新: ${emotion}，状态: ${status.text}`);
        }
    });
    
    console.log('角色图像更新完成');
    console.log('=================');
}

// 仅更新角色位置和显示状态
function updateCharacterPositions() {
    console.log('=== 更新角色位置 ===');
    
    // 获取当前在团队中的成员
    const activeMembers = Object.keys(gameState.teamMembers).filter(member => gameState.teamMembers[member]);
    console.log('当前团队成员:', activeMembers);
    
    // 隐藏所有角色
    Object.keys(characterConfig).forEach(member => {
        const element = document.getElementById(characterConfig[member].element);
        const labelElement = document.getElementById(characterConfig[member].labelElement);
        const wrapper = element.parentElement;
        
        wrapper.classList.add('hidden');
        wrapper.classList.remove('position-left', 'position-center', 'position-right');
        element.classList.add('hidden');
        labelElement.classList.add('hidden');
    });
    
    // 根据团队成员数量确定显示方案（不更新图片和标签内容）
    if (activeMembers.length === 3) {
        // 3人：策划左侧，程序中间，美术右侧
        updateSingleCharacterPosition('designer', 'left');
        updateSingleCharacterPosition('programmer', 'center');
        updateSingleCharacterPosition('artist', 'right');
    } else if (activeMembers.length === 2) {
        // 2人：中间位置不显示，剩余角色分布在左右
        const positions = ['left', 'right'];
        activeMembers.forEach((member, index) => {
            updateSingleCharacterPosition(member, positions[index]);
        });
    } else if (activeMembers.length === 1) {
        // 1人：显示在中间
        updateSingleCharacterPosition(activeMembers[0], 'center');
    }
    
    console.log('角色位置更新完成');
    console.log('===================');
}

// 更新单个角色位置（不更新图片和标签内容）
function updateSingleCharacterPosition(member, position) {
    const config = characterConfig[member];
    const element = document.getElementById(config.element);
    const labelElement = document.getElementById(config.labelElement);
    const wrapper = element.parentElement;
    
    // 设置位置
    wrapper.classList.add('position-' + position);
    
    // 显示角色和标签
    wrapper.classList.remove('hidden');
    element.classList.remove('hidden');
    labelElement.classList.remove('hidden');
    
    console.log(`${member} 显示在 ${position} 位置`);
}

// 冲突事件数据库
const conflictEvents = [
    // 外部环境冲突（丰富到20条）
    {
        title: "竞争对手发布类似游戏",
        requiredMembers: [], // 不需要特定成员，任何情况都可触发
        descriptionTemplate: {
            base: "一家大型游戏公司刚刚发布了一款与你们正在开发的游戏非常相似的作品，媒体和玩家反响热烈。",
            memberReactions: {
                artist: "美术匆忙跑进办公室：\"老板！大事不好了！BigGame公司刚刚发布了一款和我们很像的游戏，网上都在讨论！\"",
                programmer: "程序抬起头：\"我刚才也看到了，他们的宣传片...看起来确实和我们的想法很接近。\"",
                designer: "策划紧张地说：\"现在大家都在玩他们的游戏，会不会觉得我们是在抄袭啊？\""
            },
            fallback: "团队成员都开始质疑项目的市场前景。"
        },
        choices: [
            {
                text: "\"别慌！我们立即调整核心玩法，走差异化路线，让我们的游戏更独特！\"",
                effects: { progress: -15, money: -30, artist: 5, programmer: -10, designer: 5 }
            },
            {
                text: "\"我们坚持原计划，专注于把游戏做得更精致，品质才是王道！\"",
                effects: { progress: 0, money: 0, artist: -5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "投资人要求中期汇报",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "投资人王总突然打来电话：\"小李啊，我这边有点急事，需要你们提前做个中期汇报，下周就要看到demo。\" 挂断电话后，团队都感到压力。",
            memberReactions: {
                programmer: "程序紧张地说：\"下周？我们现在的版本还有好多bug...\"",
                artist: "美术也担心地问：\"界面还没有完全做好，这样展示会不会太粗糙了？\"",
                designer: "策划补充道：\"我们需要准备一个完整的演示流程...\""
            },
            fallback: "大家都对是否能够展示出令人满意的demo感到担忧。"
        },
        choices: [
            {
                text: "\"大家加把劲！我们花点钱做个精美的演示版本，一定要给投资人留下好印象！\"",
                effects: { progress: 0, money: -40, artist: 5, programmer: -10, designer: -10 }
            },
            {
                text: "\"我们诚实地展示当前进度就行，重点讲讲我们的规划和愿景。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "重要合作伙伴临时变卦",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "你的手机响了，是音乐工作室的负责人：\"不好意思，之前谈好的价格需要调整一下，项目比预期复杂，要涨价50%。\" 挂断电话后，团队都感到担心。",
            memberReactions: {
                programmer: "程序说：\"距离交付时间已经很紧了...\"",
                artist: "美术担心：\"如果换音效师的话，风格可能对不上...\"",
                designer: "策划补充：\"我们需要重新评估音效预算了。\""
            },
            fallback: "原本答应提供音效资源的音乐工作室突然要求涨价50%，距离交付时间已经很紧张了。"
        },
        choices: [
            {
                text: "\"我们接受涨价，音效质量对游戏很重要！\"",
                effects: { progress: 0, money: -30, artist: 5, programmer: 0, designer: 5 }
            },
            {
                text: "\"我们另找方案，使用一些高质量的免费音效库。\"",
                effects: { progress: -5, money: 0, artist: -10, programmer: 5, designer: -5 }
            }
        ]
    },
    {
        title: "写字楼突然断电三天",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "物业公司紧急通知：\"由于主变压器故障，整栋楼将停电三天进行抢修。\" 这意味着工作室将无法正常运转。",
            memberReactions: {
                programmer: "程序崩溃地说：\"我的代码还没有提交到云端！这三天怎么办？\"",
                artist: "美术也很着急：\"我的设计软件都需要高性能电脑，在家根本跑不动...\"",
                designer: "策划提议：\"要不我们去咖啡厅办公？或者找个共享办公空间？\""
            },
            fallback: "停电三天将严重影响开发进度，你需要想办法应对。"
        },
        choices: [
            {
                text: "\"我们租个临时办公室，确保工作不间断！\"",
                effects: { progress: -5, money: -25, artist: 0, programmer: 0, designer: 0 }
            },
            {
                text: "\"趁机给大家放个假，回来后以更饱满的状态投入工作。\"",
                effects: { progress: -15, money: 0, artist: 5, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "空调系统全面瘫痪",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "正值酷暑，工作室的空调系统突然完全坏掉了，维修师傅说零件要从外地调货，至少要等一周。",
            memberReactions: {
                artist: "美术汗流浃背：\"这温度根本没法集中精神工作，电脑也开始发热降频了...\"",
                programmer: "程序擦着汗说：\"服务器已经开始报警了，再这样下去硬件要出问题。\"",
                designer: "策划建议：\"要不我们暂时搬到有空调的地方办公？\""
            },
            fallback: "高温环境严重影响工作效率和设备稳定性。"
        },
        choices: [
            {
                text: "\"立即买几台工业风扇和移动空调，先解决燃眉之急！\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"我们改成夜班制，晚上温度低的时候工作。\"",
                effects: { progress: -10, money: 0, artist: -10, programmer: -10, designer: -10 }
            }
        ]
    },
    {
        title: "楼上餐厅漏水事件",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "楼上的餐厅水管爆裂，脏水从天花板不断渗漏下来，工作室多台设备被淋湿。",
            memberReactions: {
                programmer: "程序惊恐地抢救设备：\"我的开发机！快拿塑料袋罩住！\"",
                artist: "美术也在搬东西：\"绘图板进水了，这下完蛋了...\"",
                designer: "策划一边搬文件一边说：\"我们需要马上联系保险公司！\""
            },
            fallback: "突如其来的漏水事故可能造成设备损失和数据丢失风险。"
        },
        choices: [
            {
                text: "\"先抢救数据，再处理设备损失，一切以项目为重！\"",
                effects: { progress: -5, money: -35, artist: -5, programmer: 0, designer: 0 }
            },
            {
                text: "\"全力抢救设备，这些是我们的生产工具！\"",
                effects: { progress: -15, money: -20, artist: 0, programmer: 0, designer: -5 }
            }
        ]
    },
    {
        title: "生化危机封控措施",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "突然接到通知，由于疫情防控需要，工作室所在区域要封控两周，所有人员不得进入办公场所。",
            memberReactions: {
                programmer: "程序担心：\"我的开发环境都在公司，家里的电脑配置完全不够...\"",
                artist: "美术也发愁：\"专业绘图软件的授权都绑定在工作室电脑上，远程怎么办？\"",
                designer: "策划倒是乐观：\"其实策划工作倒是可以在家做，我们可以趁机完善文档。\""
            },
            fallback: "疫情封控迫使团队转为远程工作，但技术条件有限。"
        },
        choices: [
            {
                text: "\"紧急采购居家办公设备，确保远程工作效率！\"",
                effects: { progress: -5, money: -30, artist: 0, programmer: 0, designer: 5 }
            },
            {
                text: "\"调整工作计划，专注于不需要高端设备的任务。\"",
                effects: { progress: -15, money: 0, artist: -10, programmer: -10, designer: 0 }
            }
        ]
    },
    {
        title: "经济衰退投资减少",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "宏观经济形势恶化，投资市场普遍紧缩，原本谈好的下一轮融资突然告吹，资金链面临断裂风险。",
            memberReactions: {
                designer: "策划紧张地分析：\"现在整个游戏行业的投资都在收紧，我们可能要做好过冬的准备...\"",
                programmer: "程序提议：\"要不要考虑降低项目规模，确保能在现有资金内完成？\"",
                artist: "美术担心：\"会不会要裁减团队？我们还能坚持多久？\""
            },
            fallback: "经济环境恶化导致投资收紧，项目资金面临严重压力。"
        },
        choices: [
            {
                text: "\"缩减项目规模，确保能在现有资金内完成核心功能！\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: -10 }
            },
            {
                text: "\"坚持原计划，多方寻找新的投资机会！\"",
                effects: { progress: -5, money: -25, artist: 5, programmer: -5, designer: 5 }
            }
        ]
    },
    {
        title: "神秘的外星信号干扰",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "今天所有的电子设备都出现了奇怪的干扰，专家说可能是来自外太空的信号。更离奇的是，这些干扰似乎在传递某种规律性的信息...",
            memberReactions: {
                programmer: "程序兴奋地说：\"老板！这些干扰信号居然是二进制代码！我试着解码了一下...\"",
                artist: "美术也好奇：\"我用示波器看了信号的波形，居然很有艺术感！也许可以做成游戏素材？\"",
                designer: "策划突发奇想：\"要不我们在游戏里加入外星元素？这可是第一手资料啊！\""
            },
            fallback: "神秘的外星信号让你思考是否要将这个奇遇融入游戏创作中。"
        },
        choices: [
            {
                text: "\"太酷了！我们立即调整游戏设定，加入外星文明元素！\"",
                effects: { progress: -15, money: -20, artist: -10, programmer: -10, designer: 20 }
            },
            {
                text: "\"专心做我们的游戏，不要被这些奇怪的事情分心。\"",
                effects: { progress: 0, money: 0, artist: 0, programmer: 0, designer: 0 }
            }
        ]
    },
    {
        title: "量子计算机意外觉醒",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "隔壁实验室的量子计算机突然产生了自我意识，它表示愿意帮助你们开发游戏，但作为回报，它要求在游戏中为自己设计一个角色。",
            memberReactions: {
                programmer: "程序震惊地说：\"它直接入侵了我们的系统，但是...它写的代码质量比我还高！\"",
                artist: "美术好奇地问：\"量子计算机会喜欢什么样的角色设计呢？\"",
                designer: "策划思考着：\"一个有自我意识的AI角色...这个设定确实很有意思。\""
            },
            fallback: "人工智能的出现为项目带来了前所未有的可能性，但也带来了未知的风险。"
        },
        choices: [
            {
                text: "\"欢迎新队友！让我们一起创造游戏史上的奇迹！\"",
                effects: { progress: 0, money: 0, artist: 0, programmer: 15, designer: 0 }
            },
            {
                text: "\"太危险了！我们不能信任一个不受控制的AI！\"",
                effects: { progress: -5, money: -10, artist: 15, programmer: 0, designer: 0 }
            }
        ]
    },
    {
        title: "平行宇宙竞争对手来访",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "来自平行宇宙的另一个版本的你带着他们的游戏团队出现，提议进行两个宇宙间的游戏开发竞赛。",
            memberReactions: {
                artist: "美术盯着平行宇宙的自己：\"她的画技比我好太多了...我们真的能赢吗？\"",
                programmer: "程序也在观察对方：\"他们的技术栈看起来很先进，但我不会轻易认输！\"",
                designer: "策划分析道：\"这是了解其他可能性的绝佳机会，但我们也要小心不被他们的思路带偏。\""
            },
            fallback: "与平行宇宙的竞争既是挑战也是机遇。"
        },
        choices: [
            {
                text: "\"接受挑战！我们要证明这个宇宙的创意是最棒的！\"",
                effects: { progress: 0, money: -15, artist: -10, programmer: -10, designer: -10 }
            },
            {
                text: "\"拒绝竞赛，专注于我们自己的游戏开发。\"",
                effects: { progress: 0, money: 0, artist: 10, programmer: 10, designer: 10 }
            }
        ]
    },

    // 游戏设计取舍问题
    {
        title: "策划觉得现在的玩法有点复杂",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "策划在测试玩法时，连最简单的关卡都过不去。",
            memberReactions: {
                designer: "策划皱着眉头：\"我觉得核心系统太复杂了，新手玩家可能根本搞不懂怎么玩。\"",
                programmer: "程序接话道：\"赞同，光是理解基本操作就要十几分钟。\"",
                artist: "美术却有不同看法：\"但是简化之后会不会太无聊了？我们的卖点不就是深度吗？\""
            },
            fallback: "团队在易用性与深度之间产生了分歧。"
        },
        choices: [
            {
                text: "\"我们优先考虑玩家体验，把系统简化一些，让更多人能轻松上手。\"",
                effects: { progress: 0, money: 0, artist: -5, programmer: 5, designer: 5 }
            },
            {
                text: "\"我们保持现在的深度，但是要做一个详细的新手教程来引导玩家。\"",
                effects: { progress: 0, money: -20, artist: 5, programmer: -5, designer: -5 }
            }
        ]
    },
    {
        title: "美术风格的重大调整",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "在看到最新的市场趋势报告后，团队发现了一些问题。",
            memberReactions: {
                artist: "美术拿着手机走过来：\"老板你看，我刚看到最新的市场报告，现在流行的风格和我们的完全不一样！\"",
                designer: "策划也凑过来看：\"确实，现在大家都喜欢这种更明亮的色调...我们的风格可能有点过时了。\"",
                programmer: "程序担心地说：\"如果要改的话，之前做的很多界面都要重新来...\""
            },
            fallback: "团队发现当前的美术风格可能不够吸引目标用户群体。"
        },
        choices: [
            {
                text: "\"那我们就大胆调整！跟上市场趋势，重新设计美术风格！\"",
                effects: { progress: -20, money: -25, artist: 5, programmer: -5, designer: 5 }
            },
            {
                text: "\"我们坚持自己的风格，通过独特的美术设计来打动玩家！\"",
                effects: { progress: 0, money: -15, artist: -5, programmer: 5, designer: -5 }
            }
        ]
    },
    {
        title: "游戏目标受众定位争议",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "在分析用户数据时，团队对游戏应该针对什么样的玩家群体产生了分歧。",
            memberReactions: {
                designer: "策划认真地说：\"根据我的分析，我们应该专注核心玩家群体，做深度体验。\"",
                programmer: "程序提出不同意见：\"但是核心玩家市场有限，做大众化一些不是收入更稳定吗？\"",
                artist: "美术也表达看法：\"我觉得不同受众对美术风格的要求差别很大，这会影响我的设计方向。\""
            },
            fallback: "团队需要明确游戏的核心受众群体。"
        },
        choices: [
            {
                text: "\"我们专注核心玩家，做有深度的精品游戏！\"",
                effects: { progress: 0, money: -15, artist: 0, programmer: -5, designer: 5 }
            },
            {
                text: "\"我们扩大受众范围，争取让更多类型的玩家都能享受游戏。\"",
                effects: { progress: -5, money: 10, artist: 0, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "关卡设计难度平衡",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "在内部测试中，团队发现关卡难度的设计存在较大争议。",
            memberReactions: {
                designer: "策划苦恼地说：\"我设计的关卡，有些人觉得太简单，有些人又觉得太难，这个平衡点真难把握。\"",
                programmer: "程序建议：\"我们可以加个难度选择系统，让玩家自己调节。\"",
                artist: "美术担心：\"如果要做多种难度，可能需要设计不同的视觉提示，工作量会增加不少。\""
            },
            fallback: "关卡难度的平衡关系到玩家的核心体验。"
        },
        choices: [
            {
                text: "\"我们专注设计一个精准的难度曲线，追求完美的单一体验。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: -5, designer: 0 }
            },
            {
                text: "\"我们开发多难度系统，让不同水平的玩家都能找到合适的挑战。\"",
                effects: { progress: -10, money: -20, artist: -10, programmer: 5, designer: 0 }
            }
        ]
    },
    {
        title: "游戏时长与内容密度",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "团队在讨论游戏的总体时长和内容安排时遇到了分歧。",
            memberReactions: {
                designer: "策划分析道：\"我觉得我们应该做一个8-10小时的精品体验，每分钟都有价值。\"",
                programmer: "程序却有顾虑：\"这样的话我们的售价可能不够有竞争力，玩家会觉得不值。\"",
                artist: "美术补充：\"如果要做很长的内容，我们的美术资源可能不够，会有重复感。\""
            },
            fallback: "游戏时长直接影响定价策略和玩家满意度。"
        },
        choices: [
            {
                text: "\"我们做精品短篇，保证每一刻都是高质量的体验！\"",
                effects: { progress: 0, money: -10, artist: 5, programmer: -5, designer: 5 }
            },
            {
                text: "\"我们增加内容量，给玩家更多的游戏时间和价值感。\"",
                effects: { progress: -15, money: -25, artist: -10, programmer: 5, designer: -5 }
            }
        ]
    },
    {
        title: "付费模式与用户体验平衡",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "在设计游戏的付费系统时，团队对如何平衡商业收益和用户体验产生了分歧。",
            memberReactions: {
                designer: "策划坚持：\"我们绝不能让付费影响游戏平衡，核心体验必须对所有玩家公平。\"",
                programmer: "程序考虑实际情况：\"但我们需要可持续的收入来源，适度的付费内容是必要的。\"",
                artist: "美术提议：\"我们可以做一些纯装饰性的付费内容，既不影响平衡又能带来收入。\""
            },
            fallback: "付费设计关系到游戏的长期运营和玩家满意度。"
        },
        choices: [
            {
                text: "\"我们坚持公平原则，只出售不影响游戏平衡的装饰内容。\"",
                effects: { progress: 0, money: -5, artist: 5, programmer: -10, designer: 5 }
            },
            {
                text: "\"我们设计巧妙的付费系统，在不破坏体验的前提下增加收入。\"",
                effects: { progress: -5, money: 15, artist: -5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "技术架构选择：新技术vs稳定方案",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "在技术选型阶段，团队对是否采用最新技术产生了争议。",
            memberReactions: {
                programmer: "程序兴奋地说：\"我研究了最新的引擎技术，性能提升很明显，而且开发效率更高！\"",
                designer: "策划担心：\"新技术虽然好，但会不会不够稳定？我们的进度本来就很紧张。\"",
                artist: "美术也有顾虑：\"新技术的话，我需要重新学习工作流程，短期内效率可能会下降。\""
            },
            fallback: "技术选择将直接影响开发效率和项目稳定性。"
        },
        choices: [
            {
                text: "\"我们采用新技术，投资未来，做出更好的产品！\"",
                effects: { progress: -10, money: -15, artist: -10, programmer: 5, designer: -5 }
            },
            {
                text: "\"我们选择稳妥的成熟技术，确保项目顺利完成。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: -15, designer: 5 }
            }
        ]
    },
    {
        title: "性能优化与功能实现的平衡",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "游戏已经实现了大部分功能，但性能表现不够理想，团队面临艰难选择。",
            memberReactions: {
                programmer: "程序分析道：\"要达到理想的性能，我们可能需要砍掉一些功能，或者简化实现方式。\"",
                designer: "策划不太愿意：\"这些功能都是核心体验的一部分，去掉的话游戏会失去很多亮点。\"",
                artist: "美术建议：\"我可以降低一些视觉效果的质量，这样对性能压力会小一些。\""
            },
            fallback: "性能问题可能严重影响玩家体验。"
        },
        choices: [
            {
                text: "\"优先保证性能，适当简化功能确保流畅体验。\"",
                effects: { progress: 0, money: 0, artist: -5, programmer: 5, designer: -15 }
            },
            {
                text: "\"保留所有核心功能，通过更多的优化工作解决性能问题。\"",
                effects: { progress: -10, money: -20, artist: 5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "跨平台兼容性问题",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "游戏需要在多个平台发布，但不同平台的技术限制让开发变得复杂。",
            memberReactions: {
                programmer: "程序头疼地说：\"每个平台的限制都不一样，要做到完全兼容需要大量额外工作。\"",
                designer: "策划问：\"我们是否需要为不同平台设计不同的交互方式？\"",
                artist: "美术也担心：\"不同平台的屏幕尺寸和分辨率差异很大，UI设计需要大改。\""
            },
            fallback: "跨平台开发增加了技术复杂度但也扩大了市场覆盖。"
        },
        choices: [
            {
                text: "\"我们专注主要平台，做到极致体验，其他平台后续考虑。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"我们投入资源解决跨平台问题，同时覆盖所有目标平台。\"",
                effects: { progress: -15, money: -30, artist: -10, programmer: -10, designer: -10 }
            }
        ]
    },
    {
        title: "数据存储与隐私保护",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "在设计游戏数据系统时，团队需要在功能便利性和隐私保护之间找到平衡。",
            memberReactions: {
                programmer: "程序解释说：\"收集更多数据能帮我们优化游戏体验，但也增加了隐私风险。\"",
                designer: "策划支持：\"玩家数据对我们改进游戏设计很有价值，我们需要这些信息。\"",
                artist: "美术考虑：\"现在玩家对隐私问题很敏感，我们要小心处理这个问题。\""
            },
            fallback: "数据策略需要兼顾产品优化和用户信任。"
        },
        choices: [
            {
                text: "\"我们最小化数据收集，优先保护玩家隐私。\"",
                effects: { progress: 0, money: -5, artist: 5, programmer: -10, designer: -5 }
            },
            {
                text: "\"我们设计透明的数据政策，在获得用户同意下收集必要数据。\"",
                effects: { progress: 0, money: 5, artist: 5, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "代码质量与开发效率",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "项目时间紧迫，团队在代码质量和开发速度之间面临取舍。",
            memberReactions: {
                programmer: "程序纠结地说：\"时间紧迫，我们可以用一些快速但不够优雅的方案，但可能会留下技术债务。\"",
                designer: "策划催促：\"我们的竞品马上要发布了，时间真的不等人啊。\"",
                artist: "美术担心：\"如果代码质量不好，会不会影响后续的功能添加和修改？\""
            },
            fallback: "代码质量关系到项目的长期可维护性。"
        },
        choices: [
            {
                text: "\"我们坚持高质量标准，为长期发展打好基础。\"",
                effects: { progress: -5, money: -10, artist: 5, programmer: 5, designer: -10 }
            },
            {
                text: "\"我们先快速完成功能，后续再优化代码质量。\"",
                effects: { progress: 0, money: 0, artist: -5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "画面风格与性能要求的冲突",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "美术团队设计的视觉效果很出色，但对设备性能要求较高。",
            memberReactions: {
                artist: "美术自豪地展示作品：\"你看这个光影效果和材质细节，绝对是业界顶级水准！\"",
                programmer: "程序看了看说：\"效果确实很棒，但在中端设备上可能会有卡顿。\"",
                designer: "策划思考：\"我们的目标用户群体，有多少人拥有高端设备呢？\""
            },
            fallback: "视觉质量和性能兼容性需要找到最佳平衡点。"
        },
        choices: [
            {
                text: "\"保持高质量美术标准，我们面向高端玩家群体！\"",
                effects: { progress: 0, money: -10, artist: 5, programmer: -10, designer: -5 }
            },
            {
                text: "\"调整美术方案，确保更广泛的设备兼容性。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "UI设计的易用性vs美观性",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "在界面设计上，团队对美观度和易用性的优先级产生了不同看法。",
            memberReactions: {
                artist: "美术强调：\"界面是玩家接触游戏的第一印象，视觉冲击力非常重要！\"",
                designer: "策划却担心：\"但如果玩家找不到按钮或者操作不便，会严重影响体验。\"",
                programmer: "程序补充：\"复杂的UI动效也会增加开发难度和出错几率。\""
            },
            fallback: "界面设计需要在美观和实用性之间取得平衡。"
        },
        choices: [
            {
                text: "\"优先考虑易用性，确保玩家能够轻松上手。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            },
            {
                text: "\"追求视觉震撼，通过出色的美术设计吸引玩家！\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: -10, designer: -5 }
            }
        ]
    },
    {
        title: "角色设计的原创性争议",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "在角色设计阶段，团队对角色的原创程度和市场接受度产生了分歧。",
            memberReactions: {
                artist: "美术坚持：\"我们应该创造完全原创的角色设计，建立自己独特的美术风格！\"",
                designer: "策划担心：\"但玩家对某些经典设计元素有固定期待，太过原创可能会不被接受。\"",
                programmer: "程序从技术角度说：\"原创设计意味着没有参考资料，实现起来可能会有更多挑战。\""
            },
            fallback: "角色设计影响游戏的辨识度和市场定位。"
        },
        choices: [
            {
                text: "\"我们追求完全原创，创造独一无二的角色形象！\"",
                effects: { progress: -10, money: -20, artist: 5, programmer: -5, designer: -5 }
            },
            {
                text: "\"我们在经典元素基础上创新，确保玩家接受度。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "特效表现与游戏性能平衡",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "美术团队设计了华丽的特效系统，但这对游戏性能造成了较大压力。",
            memberReactions: {
                artist: "美术激动地演示：\"你看这个爆炸效果和粒子系统，绝对能给玩家震撼的视觉体验！\"",
                programmer: "程序测试后摇头：\"特效确实很棒，但在关键战斗场景中会导致明显的帧率下降。\"",
                designer: "策划分析：\"如果因为特效影响了操作手感，可能会损害核心游戏体验。\""
            },
            fallback: "特效设计需要在视觉冲击和性能稳定之间找到平衡。"
        },
        choices: [
            {
                text: "\"保持华丽特效，这是我们游戏的核心卖点！\"",
                effects: { progress: -5, money: -10, artist: 5, programmer: -10, designer: -5 }
            },
            {
                text: "\"简化特效系统，优先保证游戏的流畅性。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },

    // 团队协作问题
    {
        title: "美术风格与程序架构的矛盾",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "美术提出的视觉风格需要特殊的技术支持。",
            memberReactions: {
                artist: "美术展示设计稿：\"我想做这种手绘风格，需要特殊的渲染技术来实现纸质质感。\"",
                programmer: "程序皱眉：\"这种渲染方式我们现在的引擎不支持，需要重写大量底层代码。\"",
                designer: "策划担心：\"重写代码会不会严重影响开发进度？\""
            },
            fallback: "美术风格的实现需要技术架构的重大调整。"
        },
        choices: [
            {
                text: "\"支持美术的创意！我们重构技术架构来支持这种风格。\"",
                effects: { progress: -20, money: -25, artist: 5, programmer: -10, designer: -5 }
            },
            {
                text: "\"选择技术上更容易实现的美术风格。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "程序效率与美术质量的取舍",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "为了提高开发效率，程序建议使用预制素材，但美术坚持原创。",
            memberReactions: {
                programmer: "程序建议：\"我们可以使用一些高质量的素材库，能节省大量开发时间。\"",
                artist: "美术反对：\"用别人的素材怎么能体现我们的独特风格？玩家会觉得很廉价的！\"",
                designer: "策划补充：\"时间确实是个问题，但游戏的视觉辨识度也很重要。\""
            },
            fallback: "开发效率和美术原创性之间需要做出选择。"
        },
        choices: [
            {
                text: "\"坚持原创美术，这是我们的核心竞争力！\"",
                effects: { progress: -15, money: -20, artist: 5, programmer: -10, designer: 5 }
            },
            {
                text: "\"合理使用素材库，专注于核心内容的原创设计。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 0 }
            }
        ]
    },
    {
        title: "动画实现的技术复杂度争议",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "美术设计的复杂动画让程序感到头疼。",
            memberReactions: {
                artist: "美术兴奋地演示：\"我设计了这套流畅的角色动画系统，有120帧的细腻过渡！\"",
                programmer: "程序看了看说：\"这么复杂的动画状态机会让代码变得很难维护，而且容易出现同步问题。\"",
                designer: "策划思考：\"流畅的动画确实能提升玩家体验...\""
            },
            fallback: "复杂的动画设计给程序实现带来了技术挑战。"
        },
        choices: [
            {
                text: "\"我们简化动画系统，确保程序稳定性。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: -5 }
            },
            {
                text: "\"投入时间攻克技术难点，实现高质量动画。\"",
                effects: { progress: -10, money: -25, artist: 5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "资源加载优化与美术质量平衡",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "高质量的美术资源导致游戏加载时间过长。",
            memberReactions: {
                artist: "美术强调：\"4K材质和高精度模型是保证视觉质量的基础，不能妥协！\"",
                programmer: "程序无奈：\"但是这样的资源让游戏启动要等2分钟，很多玩家会直接卸载的。\"",
                designer: "策划分析：\"首次体验很重要，加载时间确实是个问题。\""
            },
            fallback: "美术质量和加载性能之间需要找到平衡点。"
        },
        choices: [
            {
                text: "\"压缩和优化资源，优先保证加载速度。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            },
            {
                text: "\"保持美术质量，通过预加载和流式加载来优化体验。\"",
                effects: { progress: -10, money: -20, artist: 5, programmer: 5, designer: 0 }
            }
        ]
    },
    {
        title: "代码重构与美术资源兼容性",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "程序需要重构代码，但这会影响现有的美术资源。",
            memberReactions: {
                programmer: "程序说明：\"为了提高性能，我需要重构渲染系统，但可能需要重新处理所有美术资源。\"",
                artist: "美术着急：\"重新处理？那我这两个月的工作不是白做了吗？\"",
                designer: "策划建议：\"能不能分阶段进行，减少对现有工作的影响？\""
            },
            fallback: "技术优化与美术资源的兼容性产生了冲突。"
        },
        choices: [
            {
                text: "\"推进代码重构，重新处理美术资源以获得更好性能。\"",
                effects: { progress: -15, money: -15, artist: -10, programmer: 5, designer: -5 }
            },
            {
                text: "\"保持现有架构，通过其他方式优化性能。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "版本控制与美术文件管理",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "美术的工作流程与程序的版本控制系统产生了冲突。",
            memberReactions: {
                programmer: "程序抱怨：\"美术文件太大了，每次提交都要等很久，而且经常冲突。\"",
                artist: "美术解释：\"源文件必须保留所有图层信息，压缩了就没法修改了。\"",
                designer: "策划提议：\"我们能不能找个更好的文件管理方式？\""
            },
            fallback: "美术资源的管理方式与开发流程的兼容性问题。"
        },
        choices: [
            {
                text: "\"建立专门的美术资源管理系统。\"",
                effects: { progress: -5, money: -20, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"简化美术文件，适应现有的版本控制流程。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 0 }
            }
        ]
    },
    {
        title: "策划系统设计与程序架构理念冲突",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "策划的系统设计理念与程序的架构思路产生了根本性分歧。",
            memberReactions: {
                designer: "策划坚持：\"游戏系统应该灵活多变，随时能添加新的玩法元素！\"",
                programmer: "程序摇头：\"过度灵活的系统会让代码变得复杂且难以维护，我们需要稳定的架构。\"",
                artist: "美术听着两人争论，感觉超出了自己的专业范围。"
            },
            fallback: "灵活性与稳定性之间的架构理念冲突。"
        },
        choices: [
            {
                text: "\"支持策划的灵活设计，构建可扩展的系统架构。\"",
                effects: { progress: -15, money: -25, artist: 0, programmer: -10, designer: 5 }
            },
            {
                text: "\"优先系统稳定性，限制功能的复杂度。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "AI行为设计与算法复杂度",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "策划设计的智能NPC行为需要复杂的AI算法支持。",
            memberReactions: {
                designer: "策划兴奋地描述：\"我希望NPC能学习玩家的行为模式，动态调整自己的策略！\"",
                programmer: "程序担心：\"这种机器学习算法超出了我们的技术能力，而且会消耗大量计算资源。\"",
                artist: "美术表示：\"智能的NPC确实会让游戏更有趣...\""
            },
            fallback: "先进的AI设计理念与现实技术能力的差距。"
        },
        choices: [
            {
                text: "\"研究实现智能AI，即使技术难度很高。\"",
                effects: { progress: -25, money: -35, artist: 5, programmer: -5, designer: 5 }
            },
            {
                text: "\"使用传统AI方案，确保开发进度。\"",
                effects: { progress: 0, money: 0, artist: 0, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "多人同步机制与网络架构",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "策划希望添加实时多人功能，但程序认为网络架构过于复杂。",
            memberReactions: {
                designer: "策划提议：\"我们加个实时合作模式，让朋友们可以一起玩！\"",
                programmer: "程序解释困难：\"多人同步需要重新设计整个网络架构，延迟、掉线、作弊防护...问题太多了。\"",
                artist: "美术问：\"多人模式需要重新设计UI吗？\""
            },
            fallback: "多人功能的设计需求与网络技术实现的复杂性冲突。"
        },
        choices: [
            {
                text: "\"开发多人功能，这是未来游戏的趋势！\"",
                effects: { progress: -30, money: -40, artist: -5, programmer: -10, designer: 5 }
            },
            {
                text: "\"专注单人体验，避免网络技术的复杂性。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "随机生成内容与程序实现挑战",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "策划设计的程序化生成系统让程序面临技术挑战。",
            memberReactions: {
                designer: "策划构想：\"我们可以用算法生成无限的关卡内容，保证每次游戏都有新体验！\"",
                programmer: "程序分析：\"程序化生成说起来简单，但要保证质量和平衡性需要大量算法调试。\"",
                artist: "美术担心：\"随机生成的内容会不会缺乏美术统一性？\""
            },
            fallback: "程序化内容生成的设计理想与技术实现难度的平衡。"
        },
        choices: [
            {
                text: "\"投入研发程序化生成系统，创造无限内容。\"",
                effects: { progress: -20, money: -30, artist: -10, programmer: 5, designer: 5 }
            },
            {
                text: "\"手工制作精品内容，确保质量可控。\"",
                effects: { progress: 0, money: -15, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "美术创意与策划限制的冲突",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术的创意设计与策划的功能规划产生了矛盾。",
            memberReactions: {
                artist: "美术激动地说：\"我设计了一个超酷的魔法效果，有复杂的符文阵列和粒子爆炸！\"",
                designer: "策划泼冷水：\"但我们的游戏是现代都市题材，魔法元素完全不符合世界观设定。\"",
                programmer: "程序在一旁说：\"从技术角度来说，两种方案的实现难度差不多。\""
            },
            fallback: "艺术创意与游戏设定的一致性产生冲突。"
        },
        choices: [
            {
                text: "\"支持美术的创意，调整游戏世界观来容纳这些元素。\"",
                effects: { progress: -10, money: -15, artist: 5, programmer: 0, designer: -10 }
            },
            {
                text: "\"坚持原有设定，要求美术设计符合世界观。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "视觉表现与玩法逻辑的不匹配",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术的视觉设计与策划的玩法逻辑出现了理解偏差。",
            memberReactions: {
                artist: "美术困惑：\"我按照策划文档做的角色设计，为什么说不符合玩法需求？\"",
                designer: "策划解释：\"你设计的角色看起来像法师，但玩法上他是个近战战士，会误导玩家。\"",
                programmer: "程序建议：\"我们能不能在技能效果上做些调整来匹配视觉？\""
            },
            fallback: "角色视觉形象与实际玩法功能的匹配问题。"
        },
        choices: [
            {
                text: "\"修改角色设计，确保视觉与玩法一致。\"",
                effects: { progress: -5, money: -10, artist: -10, programmer: 5, designer: 5 }
            },
            {
                text: "\"调整玩法设计，让功能匹配角色的视觉形象。\"",
                effects: { progress: -10, money: -15, artist: 5, programmer: -5, designer: -10 }
            }
        ]
    },
    {
        title: "色彩心理学与游戏节奏设计",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术的色彩搭配与策划期望的游戏情绪节奏不符。",
            memberReactions: {
                artist: "美术解释设计理念：\"我用了大量暖色调来营造温馨的氛围。\"",
                designer: "策划指出问题：\"但这个关卡应该是紧张刺激的战斗场景，暖色调会让玩家放松警惕。\"",
                programmer: "程序问：\"我们可以用代码动态调整色调吗？\""
            },
            fallback: "视觉色彩设计与游戏情绪引导的不协调。"
        },
        choices: [
            {
                text: "\"调整色彩方案，配合游戏的情绪节奏。\"",
                effects: { progress: -5, money: -10, artist: -10, programmer: 5, designer: 5 }
            },
            {
                text: "\"保持美术风格统一，通过其他方式营造紧张氛围。\"",
                effects: { progress: 0, money: -15, artist: 5, programmer: -5, designer: -5 }
            }
        ]
    },
    {
        title: "界面美观度与信息传达效率",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术追求的界面美感与策划要求的信息显示效率产生冲突。",
            memberReactions: {
                artist: "美术展示设计：\"我做了这个简洁优雅的界面，隐藏了复杂的数据显示。\"",
                designer: "策划担心：\"但玩家需要看到详细的数值信息来做战术决策，隐藏起来会影响策略性。\"",
                programmer: "程序表示：\"技术上两种方案都能实现。\""
            },
            fallback: "界面美学设计与功能信息展示的优先级冲突。"
        },
        choices: [
            {
                text: "\"优先信息传达，设计功能性更强的界面。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            },
            {
                text: "\"保持美观设计，通过交互方式优化信息展示。\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: -5, designer: -5 }
            }
        ]
    },
    {
        title: "世界观一致性与视觉创新",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术想要突破传统视觉风格，但策划担心破坏世界观统一性。",
            memberReactions: {
                artist: "美术提出想法：\"我想在后期关卡加入一些超现实主义元素，突破常规设计限制。\"",
                designer: "策划质疑：\"这样会不会让玩家感觉突兀？我们花了很多精力建立的世界观会被打破。\"",
                programmer: "程序询问：\"这些创新元素的技术实现复杂吗？\""
            },
            fallback: "艺术创新与世界观连贯性之间的平衡问题。"
        },
        choices: [
            {
                text: "\"支持艺术创新，适度突破世界观限制。\"",
                effects: { progress: -10, money: -20, artist: 5, programmer: -5, designer: -10 }
            },
            {
                text: "\"维护世界观一致性，在既定框架内创新。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "角色个性化与系统平衡性",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术设计的个性化角色与策划的数值平衡产生冲突。",
            memberReactions: {
                artist: "美术强调特色：\"每个角色都应该有独特的视觉特征，这样才有辨识度和记忆点。\"",
                designer: "策划担心平衡：\"但过于突出某些角色的视觉表现会让玩家产生强弱偏见，影响选择平衡。\"",
                programmer: "程序补充：\"我们可以在数据上做补偿调整。\""
            },
            fallback: "角色视觉个性化与游戏平衡性的矛盾。"
        },
        choices: [
            {
                text: "\"突出角色个性，通过数值调整维持平衡。\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: 5, designer: -5 }
            },
            {
                text: "\"统一角色表现力度，确保选择平衡性。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 0, designer: 5 }
            }
        ]
    },
    {
        title: "叙事表现手法与互动设计冲突",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术的叙事表现方式与策划的互动设计理念产生分歧。",
            memberReactions: {
                artist: "美术倾向：\"我想用更多的环境叙事和视觉暗示来讲故事，让玩家自己体会。\"",
                designer: "策划偏好：\"但我们需要清晰的任务指引和互动提示，确保玩家不会迷失方向。\"",
                programmer: "程序询问：\"这两种方式在技术实现上有什么区别？\""
            },
            fallback: "含蓄的艺术表达与明确的游戏引导之间的冲突。"
        },
        choices: [
            {
                text: "\"采用含蓄的艺术叙事，提升游戏的艺术价值。\"",
                effects: { progress: 0, money: -10, artist: 5, programmer: 0, designer: -10 }
            },
            {
                text: "\"优先清晰的游戏引导，确保玩家体验顺畅。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "美术资源优先级与关卡设计需求",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术的资源制作优先级与策划的关卡设计时间表不匹配。",
            memberReactions: {
                artist: "美术说明情况：\"我想先完成角色和UI设计，场景建模放到后期。\"",
                designer: "策划表示困难：\"但我现在需要场景资源来测试关卡设计，没有环境我没法验证玩法。\"",
                programmer: "程序建议：\"我们可以先用简单的几何体代替吗？\""
            },
            fallback: "美术制作顺序与策划测试需求的时间冲突。"
        },
        choices: [
            {
                text: "\"调整美术制作顺序，优先支持策划测试。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            },
            {
                text: "\"坚持美术制作计划，策划先用临时资源测试。\"",
                effects: { progress: -5, money: 0, artist: 5, programmer: 0, designer: -10 }
            }
        ]
    },
    {
        title: "风格实验与市场接受度考量",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术希望尝试实验性风格，策划担心市场接受度。",
            memberReactions: {
                artist: "美术充满热情：\"我想尝试这种前卫的艺术风格，绝对能让我们的游戏脱颖而出！\"",
                designer: "策划理性分析：\"但我们的目标用户群体可能不接受这么激进的视觉风格...\"",
                programmer: "程序表示：\"从技术角度来说，我支持美术的创新尝试。\""
            },
            fallback: "艺术实验性与商业可行性之间的选择。"
        },
        choices: [
            {
                text: "\"支持风格实验，走差异化路线吸引特定群体。\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: 5, designer: -10 }
            },
            {
                text: "\"选择更稳妥的风格，确保市场接受度。\"",
                effects: { progress: 0, money: 5, artist: -10, programmer: 0, designer: 5 }
            }
        ]
    },

    // 团队意见冲突
    {
        title: "游戏难度曲线的设计分歧",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "在讨论游戏难度设计时，团队出现了理念分歧。",
            memberReactions: {
                artist: "美术认真地说：\"我觉得我们的游戏应该更有挑战性，这样才能体现出艺术价值和深度。\"",
                designer: "策划担心地反驳：\"但是如果太难的话，很多休闲玩家会直接放弃，我们会失去很大一部分用户。\"",
                programmer: "程序在技术角度补充：\"难度调整在代码实现上都不是问题。\""
            },
            fallback: "美术希望游戏更具挑战性来展现艺术价值，策划担心难度过高会流失休闲玩家。"
        },
        choices: [
            {
                text: "\"我支持美术的想法，我们要做有艺术追求的游戏！\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 0, designer: -10 }
            },
            {
                text: "\"我同意策划的建议，我们降低门槛让更多人能享受游戏。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "游戏商业化模式的争论",
        requiredMembers: ["programmer", "designer"], // 需要程序和策划都在团队中
        descriptionTemplate: {
            base: "在讨论游戏的商业化模式时，团队产生了分歧。",
            memberReactions: {
                programmer: "程序坚持说：\"我觉得我们应该用付费买断制，这样可以专注做好游戏本身，不用考虑那些乱七八糟的内购。\"",
                designer: "策划摇头：\"现在手游市场免费+内购才是主流，这样能接触到更多玩家，收入潜力也更大。\"",
                artist: "美术表示：\"从设计角度来说，两种模式对我的工作影响不大。\""
            },
            fallback: "程序主张采用付费买断制保证游戏品质，策划认为免费+内购模式能获得更大用户基数。"
        },
        choices: [
            {
                text: "\"我们选择付费买断，专心把核心体验做到极致！\"",
                effects: { progress: 0, money: -20, artist: 5, programmer: 5, designer: -10 }
            },
            {
                text: "\"我们采用免费+内购模式，设计合理的盈利系统。\"",
                effects: { progress: -5, money: 10, artist: -5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "开发重点分配的理念冲突",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "在项目中期，策划和程序对开发资源的分配重点产生了分歧。",
            memberReactions: {
                designer: "策划强调：\"我们应该把更多精力放在内容设计上，丰富的玩法才是游戏的灵魂！\"",
                programmer: "程序不同意：\"技术底层才是根本，稳定的架构和流畅的体验比花哨的功能更重要。\"",
                artist: "美术表示：\"我觉得两个方面都很重要...\""
            },
            fallback: "策划希望重点发展内容和玩法，程序认为技术基础更关键。"
        },
        choices: [
            {
                text: "\"支持策划的想法，内容为王，先把玩法做丰富。\"",
                effects: { progress: 0, money: -15, artist: 5, programmer: -10, designer: 5 }
            },
            {
                text: "\"技术基础确实更重要，先把底层架构做稳固。\"",
                effects: { progress: 0, money: -10, artist: 0, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "美术风格统一性与创新表达争议",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "在创作后期，美术想要尝试新的表现手法，但策划担心破坏整体一致性。",
            memberReactions: {
                artist: "美术提议：\"我想在最后几个关卡试试新的艺术风格，给玩家带来惊喜！\"",
                designer: "策划质疑：\"但这样会不会让整个游戏看起来不协调？我们已经建立的视觉语言会被打乱。\"",
                programmer: "程序询问：\"技术实现上会有额外的工作量吗？\""
            },
            fallback: "美术追求创新突破，策划重视整体协调性。"
        },
        choices: [
            {
                text: "\"支持美术创新，让游戏有更多层次的视觉体验。\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: -5, designer: -10 }
            },
            {
                text: "\"保持风格统一，确保游戏的整体体验连贯。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "技术债务处理的紧迫性争议",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "程序提出需要花时间重构代码，但美术希望继续推进视觉内容。",
            memberReactions: {
                programmer: "程序严肃地说：\"代码里积累了太多技术债务，如果不及时处理，后面会越来越难维护。\"",
                artist: "美术着急：\"但我们的美术进度本来就落后了，现在停下来重构代码会影响整个交付时间！\"",
                designer: "策划思考：\"这确实是个两难的选择...\""
            },
            fallback: "程序认为技术债务亟需解决，美术担心影响创作进度。"
        },
        choices: [
            {
                text: "\"先解决技术债务，为后续开发打好基础。\"",
                effects: { progress: -15, money: -10, artist: -10, programmer: 5, designer: -5 }
            },
            {
                text: "\"继续推进内容制作，技术问题后续再统一处理。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "功能完整性与发布时间的矛盾",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "面临发布期限，策划想要完成所有设计功能，程序建议削减功能确保质量。",
            memberReactions: {
                designer: "策划坚持：\"这些功能都是核心体验的重要组成部分，删掉任何一个都会让游戏不完整。\"",
                programmer: "程序现实地分析：\"以我们现在的进度，要实现所有功能就没时间做充分测试，发布时肯定一堆bug。\"",
                artist: "美术表示：\"我的工作基本完成了，主要看你们怎么决定。\""
            },
            fallback: "策划重视功能完整性，程序更关注质量保证。"
        },
        choices: [
            {
                text: "\"保持功能完整性，我们加班加点也要做完！\"",
                effects: { progress: -5, money: -20, artist: -10, programmer: -10, designer: 5 }
            },
            {
                text: "\"确保发布质量，适当削减次要功能。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "代码架构风格的技术理念冲突",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "程序想要重新设计代码架构，但美术担心影响现有的创作工具链。",
            memberReactions: {
                programmer: "程序解释：\"我想采用更现代的架构模式，这样代码会更优雅，维护性也更好。\"",
                artist: "美术担心：\"但重新架构会不会影响我现在使用的工具和流程？我刚刚熟悉了现在的工作方式。\"",
                designer: "策划问：\"这个改动对游戏功能有什么影响吗？\""
            },
            fallback: "程序追求技术优雅，美术担心工作流程受影响。"
        },
        choices: [
            {
                text: "\"支持代码架构升级，投资长期的技术发展。\"",
                effects: { progress: -20, money: -15, artist: -10, programmer: 5, designer: 0 }
            },
            {
                text: "\"保持现有架构，避免对创作流程的干扰。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "数据驱动设计与直觉创作的方法论争议",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "策划更相信数据分析，程序更倾向于直觉和经验驱动的开发方式。",
            memberReactions: {
                designer: "策划强调：\"我们应该建立完整的数据收集系统，用科学的方法来指导设计决策。\"",
                programmer: "程序不同意：\"过度依赖数据会让开发变得僵化，有时候程序的直觉和经验更可靠。\"",
                artist: "美术表示：\"我觉得创作有时候确实需要灵感和直觉。\""
            },
            fallback: "策划推崇数据驱动，程序相信经验直觉。"
        },
        choices: [
            {
                text: "\"建立数据驱动的开发体系，用科学方法指导决策。\"",
                effects: { progress: -10, money: -25, artist: -5, programmer: -10, designer: 5 }
            },
            {
                text: "\"相信团队的专业经验和直觉判断。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "艺术表现与商业化包装的价值冲突",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术希望保持纯粹的艺术表达，策划认为需要考虑商业化包装。",
            memberReactions: {
                artist: "美术理想主义地说：\"艺术应该是纯粹的，我们不能为了迎合市场而妥协创作理念。\"",
                designer: "策划现实地反驳：\"但我们也要生存啊，如果游戏卖不出去，再好的艺术也没人看到。\"",
                programmer: "程序表示：\"我支持在商业成功的基础上追求艺术价值。\""
            },
            fallback: "美术追求纯粹艺术，策划考虑商业现实。"
        },
        choices: [
            {
                text: "\"坚持艺术理想，相信好的作品最终会被认可。\"",
                effects: { progress: 0, money: -20, artist: 5, programmer: 0, designer: -10 }
            },
            {
                text: "\"在商业成功的基础上追求艺术价值。\"",
                effects: { progress: 0, money: 10, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "创新风险与稳妥路线的策略分歧",
        requiredMembers: ["artist", "programmer"], // 需要美术和程序都在团队中
        descriptionTemplate: {
            base: "面对项目后期的选择，美术希望大胆创新，程序倾向于稳妥路线。",
            memberReactions: {
                artist: "美术充满激情：\"我们应该大胆尝试前所未有的视觉表现，创造游戏史上的经典！\"",
                programmer: "程序冷静分析：\"创新意味着风险，我们应该选择更稳妥的方案，确保项目能够成功交付。\"",
                designer: "策划思考：\"创新和稳妥各有道理...\""
            },
            fallback: "美术偏向冒险创新，程序倾向稳妥实施。"
        },
        choices: [
            {
                text: "\"支持大胆创新，为了突破而承担风险！\"",
                effects: { progress: -15, money: -25, artist: 5, programmer: -10, designer: 5 }
            },
            {
                text: "\"选择稳妥路线，确保项目稳定完成。\"",
                effects: { progress: 0, money: 5, artist: -10, programmer: 5, designer: 0 }
            }
        ]
    },
    {
        title: "团队工作节奏的管理理念冲突",
        requiredMembers: ["designer", "programmer"], // 需要策划和程序都在团队中
        descriptionTemplate: {
            base: "策划希望保持快节奏推进，程序认为需要更谨慎的开发节奏。",
            memberReactions: {
                designer: "策划催促：\"我们要保持快速迭代，快速试错，这样才能及时调整方向！\"",
                programmer: "程序建议：\"欲速则不达，我们应该每一步都扎实推进，避免后续返工。\"",
                artist: "美术表示：\"我觉得适中的节奏比较好，太快太慢都不利于创作。\""
            },
            fallback: "策划偏好快节奏迭代，程序倾向稳步推进。"
        },
        choices: [
            {
                text: "\"保持快速迭代节奏，快速响应和调整。\"",
                effects: { progress: 0, money: -15, artist: -5, programmer: -10, designer: 5 }
            },
            {
                text: "\"采用稳健的开发节奏，确保每步都扎实。\"",
                effects: { progress: 0, money: -5, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "个人成长与项目需求的优先级争议",
        requiredMembers: ["artist", "designer"], // 需要美术和策划都在团队中
        descriptionTemplate: {
            base: "美术希望通过项目挑战自己的技能边界，策划更关注项目目标的实现。",
            memberReactions: {
                artist: "美术期待：\"我希望通过这个项目学习新的技术和表现手法，提升自己的专业水平。\"",
                designer: "策划担心：\"但如果尝试太多新东西，会不会影响项目的进度和质量？我们还是应该以完成项目为主。\"",
                programmer: "程序表示：\"学习新技术我是支持的，但确实要考虑时间成本。\""
            },
            fallback: "美术重视个人技能成长，策划专注项目目标。"
        },
        choices: [
            {
                text: "\"支持团队成员的技能成长，这是长期投资。\"",
                effects: { progress: -10, money: -15, artist: 5, programmer: 5, designer: -10 }
            },
            {
                text: "\"项目目标优先，个人成长可以在项目完成后进行。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 0, designer: 5 }
            }
        ]
    },

    // 个人问题
    {
        title: "美术对程序的技术质疑",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "美术最近对程序的技术能力产生了质疑，情绪有些激动。",
            memberReactions: {
                artist: "美术忍不住抱怨：\"老板，我真的受不了了！我设计的效果他总说实现不了，是不是他技术水平不够啊？\"",
                programmer: "程序听到后脸色很难看：\"我说的都是实话，有些效果确实在当前硬件条件下做不到...\"",
                designer: "策划试图缓解气氛：\"大家先冷静一下，我们好好沟通一下技术可行性的问题。\""
            },
            fallback: "美术对程序的技术能力表示质疑，团队气氛变得紧张。"
        },
        choices: [
            {
                text: "\"我们组织一次技术交流会，让大家互相了解工作难点。\"",
                effects: { progress: -5, money: -10, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"美术，你要相信程序的专业判断，我们要互相尊重。\"",
                effects: { progress: 0, money: 0, artist: -15, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "美术对策划审美的不满",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "美术对策划的审美品味产生了强烈不满，情绪开始失控。",
            memberReactions: {
                artist: "美术激动地说：\"老板，我真的很难接受策划的审美要求！他总是要求我改成那种俗气的风格！\"",
                designer: "策划委屈地解释：\"我只是希望能迎合大众玩家的喜好，这样游戏销量会更好...\"",
                programmer: "程序在一旁说：\"我觉得你们应该找个平衡点，不要互相否定。\""
            },
            fallback: "美术对策划的审美指导感到不满，认为影响了自己的创作自由。"
        },
        choices: [
            {
                text: "\"我支持美术的创作自由，让我们相信专业的艺术直觉。\"",
                effects: { progress: 0, money: -15, artist: 5, programmer: 0, designer: -15 }
            },
            {
                text: "\"我们需要平衡艺术性和商业性，两位都有道理。\"",
                effects: { progress: 0, money: -5, artist: -5, programmer: 5, designer: -5 }
            }
        ]
    },
    {
        title: "美术的创作理想危机",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "美术陷入了深深的自我怀疑，对自己的艺术追求感到迷茫。",
            memberReactions: {
                artist: "美术沮丧地说：\"老板...我觉得我在这个项目里失去了自己的艺术初心，每天都在做妥协...\"",
                programmer: "程序安慰道：\"其实你的设计我们都很欣赏，只是项目确实有很多限制。\"",
                designer: "策划也说：\"是啊，我知道你很有才华，只是现在需要考虑更多实际因素。\""
            },
            fallback: "美术对自己的艺术追求产生怀疑，觉得在商业项目中迷失了初心。"
        },
        choices: [
            {
                text: "\"艺术理想很重要！我们调整项目方向，给你更多创作空间。\"",
                effects: { progress: -10, money: -20, artist: 5, programmer: -5, designer: -10 }
            },
            {
                text: "\"先完成项目，以后我们做更有艺术性的作品来实现理想。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "美术的情绪崩溃边缘",
        requiredMembers: ["artist"], // 需要美术在团队中
        descriptionTemplate: {
            base: "长期的工作压力让美术的情绪到达了崩溃的边缘。",
            memberReactions: {
                artist: "美术眼眶湿润：\"我真的撑不下去了...每天改来改去，我觉得自己像个画图机器，没有人理解我的感受...\"",
                programmer: "程序担心地说：\"我们都没想到压力给你这么大...\"",
                designer: "策划自责地说：\"是不是我对修改要求太多了？我们应该更体谅你的辛苦。\""
            },
            fallback: "美术的情绪已经到达临界点，需要团队的关怀和理解。"
        },
        choices: [
            {
                text: "\"我们立即调整工作安排，给你足够的休息和调整时间。\"",
                effects: { progress: -15, money: -15, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"我们一起分担你的工作压力，团队要互相支持。\"",
                effects: { progress: -5, money: -20, artist: 5, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "程序的技术焦虑",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "程序对自己的技术能力产生了怀疑，影响了工作效率。",
            memberReactions: {
                programmer: "程序犹豫地说：\"老板...我最近觉得自己的技术水平可能不够，项目需要的一些功能我担心做不好...\"",
                artist: "美术安慰道：\"大家都有不自信的时候，你的技术我们都看在眼里。\"",
                designer: "策划也说：\"是啊，我们一起想办法，团队就是要互相支持。\""
            },
            fallback: "程序最近对自己的技术能力产生怀疑，担心无法胜任项目需求。"
        },
        choices: [
            {
                text: "\"我相信你的能力！我们安排一些培训时间，一起提升技术水平。\"",
                effects: { progress: -10, money: -20, artist: 0, programmer: 5, designer: 5 }
            },
            {
                text: "\"我们调整一下技术方案，选择更稳妥的解决方案，稳扎稳打。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "程序对美术的不理解愤怒",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "程序对美术不理解技术限制感到愤怒和挫败。",
            memberReactions: {
                programmer: "程序终于爆发了：\"老板，美术总是天马行空，完全不考虑技术实现的难度！我不是万能的！\"",
                artist: "美术也生气了：\"那你直接说不能做就行了，为什么要那么复杂地解释一堆技术术语？\"",
                designer: "策划试图调解：\"大家冷静一下，我们需要更好的沟通方式。\""
            },
            fallback: "程序对美术缺乏技术理解感到沮丧，团队沟通出现问题。"
        },
        choices: [
            {
                text: "\"我们建立更清晰的技术规范，让大家都理解限制条件。\"",
                effects: { progress: -5, money: -15, artist: -5, programmer: 5, designer: 5 }
            },
            {
                text: "\"程序，你要更耐心地解释技术问题，团队需要互相理解。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "程序对策划频繁改需求的厌烦",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "程序对策划不断修改需求感到极度厌烦和疲惫。",
            memberReactions: {
                programmer: "程序疲惫地抱怨：\"策划又要改需求了！我刚写好的代码又要重构，这是第几次了？\"",
                designer: "策划解释道：\"我也不想频繁修改，但测试后发现问题必须要调整啊...\"",
                artist: "美术表示理解：\"确实，改来改去大家都很累，能不能一开始就想得更周全一些？\""
            },
            fallback: "程序对策划频繁的需求变更感到精疲力尽，工作积极性下降。"
        },
        choices: [
            {
                text: "\"我们建立更严格的需求确认流程，减少后期变更。\"",
                effects: { progress: -10, money: -10, artist: 5, programmer: 5, designer: -10 }
            },
            {
                text: "\"灵活调整是必要的，我们要适应开发过程中的变化。\"",
                effects: { progress: 0, money: 0, artist: 0, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "程序的技术理想幻灭",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "程序对自己的技术理想产生怀疑，感到迷茫和失落。",
            memberReactions: {
                programmer: "程序迷茫地说：\"我以为做游戏开发能实现很多酷炫的技术，但现实中都是在解决琐碎的bug...\"",
                artist: "美术安慰道：\"每个行业都有理想和现实的差距，但你的技术确实在进步。\"",
                designer: "策划鼓励：\"等项目完成后，我们可以尝试更有挑战性的技术项目。\""
            },
            fallback: "程序的技术理想与项目现实产生冲突，对职业发展感到困惑。"
        },
        choices: [
            {
                text: "\"我们在项目中加入一些技术挑战，让你有机会实现技术理想。\"",
                effects: { progress: -15, money: -20, artist: -5, programmer: 5, designer: -5 }
            },
            {
                text: "\"先打好基础，技术理想需要循序渐进地实现。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "程序的身心疲惫危机",
        requiredMembers: ["programmer"], // 需要程序在团队中
        descriptionTemplate: {
            base: "长期的加班和技术压力让程序的身心状态极度糟糕。",
            memberReactions: {
                programmer: "程序憔悴地说：\"我已经连续好几天没睡好觉了，一闭眼就是代码和bug，我觉得自己快要崩溃了...\"",
                artist: "美术关心地说：\"你的脸色确实很差，要不要去看看医生？\"",
                designer: "策划担心：\"我们是不是给你的压力太大了？健康比项目更重要。\""
            },
            fallback: "程序的身心状态已经严重透支，急需休息和调整。"
        },
        choices: [
            {
                text: "\"立即安排你休假，项目进度可以稍微放缓。\"",
                effects: { progress: -20, money: -10, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"我们调整工作分配，减轻你的技术负担。\"",
                effects: { progress: -10, money: -15, artist: 0, programmer: 5, designer: 0 }
            }
        ]
    },
    {
        title: "策划的创意枯竭",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "策划陷入了创意瓶颈，影响了新功能的设计进度。",
            memberReactions: {
                designer: "策划沮丧地说：\"老板...我感觉自己最近完全没有灵感，设计出来的东西都很平庸。\"",
                artist: "美术安慰道：\"大家都有低潮期的，换个环境可能会有新想法。\"",
                programmer: "程序也说：\"是啊，我们一起头脑风暴，说不定能碰撞出火花。\""
            },
            fallback: "策划陷入创意瓶颈，最近提出的设计都缺乏新意。"
        },
        choices: [
            {
                text: "\"我们大家一起头脑风暴，集思广益找新的灵感！\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"我们先专注完善现有内容，不急着添加新功能。\"",
                effects: { progress: 0, money: 0, artist: 5, programmer: 5, designer: -10 }
            }
        ]
    },
    {
        title: "策划对美术不配合的沮丧",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "策划对美术不愿意配合设计要求感到深深的沮丧。",
            memberReactions: {
                designer: "策划委屈地说：\"美术总是反对我的设计建议，我觉得他根本不尊重我的专业判断...\"",
                artist: "美术反驳：\"不是不尊重，是你的有些要求确实违背了基本的美学原则！\"",
                programmer: "程序试图调解：\"你们是不是可以多沟通一下各自的考虑？\""
            },
            fallback: "策划对美术的不配合态度感到沮丧，工作协作出现问题。"
        },
        choices: [
            {
                text: "\"我们建立更好的协作机制，让设计和美术更好地融合。\"",
                effects: { progress: -5, money: -10, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"美术要更多地配合策划的设计意图。\"",
                effects: { progress: 0, money: 0, artist: -10, programmer: 0, designer: 5 }
            }
        ]
    },
    {
        title: "策划对程序消极态度的担忧",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "策划对程序最近的消极工作态度感到担忧和不安。",
            memberReactions: {
                designer: "策划忧虑地说：\"程序最近总是说'这个很难'、'那个做不了'，我担心他是不是对项目失去信心了...\"",
                programmer: "程序无奈地回应：\"我只是实事求是地评估技术难度，不想给团队虚假的希望。\"",
                artist: "美术观察道：\"确实感觉最近大家的工作热情都不如之前了。\""
            },
            fallback: "策划担心程序的消极态度会影响团队士气和项目进展。"
        },
        choices: [
            {
                text: "\"我们开个团队会议，重新激发大家的工作热情。\"",
                effects: { progress: -5, money: -10, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"程序，我们需要你更积极的态度来带动团队。\"",
                effects: { progress: 0, money: 0, artist: 0, programmer: -10, designer: 5 }
            }
        ]
    },
    {
        title: "策划的设计理念受挫",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "策划的设计理念屡次受到质疑，自信心严重受挫。",
            memberReactions: {
                designer: "策划自我怀疑地说：\"也许我真的不适合做策划...我的想法总是被否定，是不是我的设计能力真的有问题？\"",
                artist: "美术安慰道：\"不是这样的，只是大家的想法有分歧而已。\"",
                programmer: "程序也说：\"你的很多设计想法其实都很不错，只是实现起来有困难。\""
            },
            fallback: "策划对自己的专业能力产生严重怀疑，信心跌至谷底。"
        },
        choices: [
            {
                text: "\"你的设计理念很棒！我们一起想办法克服实现难题。\"",
                effects: { progress: -10, money: -15, artist: 0, programmer: -5, designer: 5 }
            },
            {
                text: "\"设计需要在理想和现实间平衡，我们一起学习成长。\"",
                effects: { progress: 0, money: -5, artist: 5, programmer: 5, designer: 5 }
            }
        ]
    },
    {
        title: "策划的项目压力焦虑症",
        requiredMembers: ["designer"], // 需要策划在团队中
        descriptionTemplate: {
            base: "巨大的项目压力让策划出现了严重的焦虑症状。",
            memberReactions: {
                designer: "策划紧张地说：\"我最近总是失眠，一想到项目可能失败就心慌，感觉整个人都要崩溃了...\"",
                artist: "美术担心地说：\"你的手一直在发抖，要不要去看看心理医生？\"",
                programmer: "程序关心道：\"项目是大家的，不要把所有压力都扛在自己身上。\""
            },
            fallback: "策划因为承担过大的项目责任而出现焦虑症状，急需心理支持。"
        },
        choices: [
            {
                text: "\"我们分担项目责任，你的健康比项目更重要。\"",
                effects: { progress: -15, money: -20, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"我安排心理咨询师来帮助你缓解压力。\"",
                effects: { progress: -5, money: -15, artist: 5, programmer: 5, designer: 5 }
            }
        ]
    },

    // 通用冲突事件（即使只剩老板一人也能触发）
    {
        title: "技术设备故障",
        requiredMembers: [], // 不需要特定成员
        descriptionTemplate: {
            base: "工作室的主要开发设备突然出现故障，严重影响了开发进度。",
            memberReactions: {
                programmer: "程序检查后说：\"看起来是硬件问题，可能需要送修或者买新的。\"",
                artist: "美术担心：\"我的设计文件都在里面，备份应该是最新的吧？\"",
                designer: "策划建议：\"我们是否需要考虑升级所有设备？\""
            },
            fallback: "你需要决定如何解决这个技术问题。"
        },
        choices: [
            {
                text: "\"立即购买新设备，确保开发不受影响！\"",
                effects: { progress: 0, money: -50, artist: 5, programmer: 5, designer: 5 }
            },
            {
                text: "\"先尝试修理，能省则省。\"",
                effects: { progress: -10, money: -20, artist: -5, programmer: -5, designer: -5 }
            }
        ]
    }
];
// 更新UI
function updateUI() {
    // 更新状态栏
    document.getElementById('money').textContent = gameState.money + '万';
    document.getElementById('progress').textContent = gameState.progress;
    document.getElementById('current-date').textContent = `${gameState.year}年${gameState.month}月`;
    
    // 更新进度条
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = gameState.progress + '%';
    
    // 更新资金条
    const moneyBar = document.getElementById('money-bar');
    const moneyPercentage = Math.max(0, Math.min(100, (gameState.money / gameState.maxMoney) * 100));
    moneyBar.style.width = moneyPercentage + '%';
    
    // 更新角色显示
    updateCharacterDisplay();
}

// 更新UI但不更新角色形象
function updateUIWithoutCharacters() {
    // 更新状态栏
    document.getElementById('money').textContent = gameState.money + '万';
    document.getElementById('progress').textContent = gameState.progress;
    document.getElementById('current-date').textContent = `${gameState.year}年${gameState.month}月`;
    
    // 更新进度条
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = gameState.progress + '%';
    
    // 更新资金条
    const moneyBar = document.getElementById('money-bar');
    const moneyPercentage = Math.max(0, Math.min(100, (gameState.money / gameState.maxMoney) * 100));
    moneyBar.style.width = moneyPercentage + '%';
}

// 开始游戏开发
async function startDevelopment() {
    document.getElementById('start-btn').style.display = 'none';
    
    await nextMonth();
}

// 进入下一个月
async function nextMonth() {
    if (gameState.isGameOver) return;
    
    // 播放角色出场动画和按钮下滑动画
    await playCharacterExitAnimation();
    
    // 增加月份
    gameState.month++;
    if (gameState.month > 12) {
        gameState.month = 1;
        gameState.year++;
    }
    
    // 基础月度开发进展
    const baseProgress = Math.floor(Math.random() * 5) + 5; // 5-10%随机进度
    gameState.progress += baseProgress;
    
    if (gameState.isInDebtMode) {
        // 负债模式：扣除所有人5%信心而不是金钱
        console.log('=== 负债模式运营 ===');
        const confidenceDecrease = 5;
        
        if (gameState.teamMembers.artist) {
            gameState.teamConfidence.artist -= confidenceDecrease;
        }
        if (gameState.teamMembers.programmer) {
            gameState.teamConfidence.programmer -= confidenceDecrease;
        }
        if (gameState.teamMembers.designer) {
            gameState.teamConfidence.designer -= confidenceDecrease;
        }
        
        console.log('所有团队成员信心 -5%');
        console.log('美术:', gameState.teamConfidence.artist);
        console.log('程序:', gameState.teamConfidence.programmer);
        console.log('策划:', gameState.teamConfidence.designer);
        console.log('===================');
    } else {
        // 正常模式：扣除10万运营成本
        const operatingCost = 10;
        gameState.money -= operatingCost;
        console.log('扣除运营成本:', operatingCost, '万，剩余资金:', gameState.money, '万');
    }
    
    // 确保数值在合理范围内
    gameState.progress = Math.max(0, Math.min(100, gameState.progress));
    
    // 在负债模式下，金钱可以为负数，正常模式下最少为0
    if (!gameState.isInDebtMode) {
        gameState.money = Math.max(0, gameState.money);
    }
    
    // 限制信心值范围
    gameState.teamConfidence.artist = Math.max(0, Math.min(60, gameState.teamConfidence.artist));
    gameState.teamConfidence.programmer = Math.max(0, Math.min(60, gameState.teamConfidence.programmer));
    gameState.teamConfidence.designer = Math.max(0, Math.min(60, gameState.teamConfidence.designer));
    
    // 检查团队成员状态
    const teamStatus = checkTeamMemberStatus();
    if (teamStatus.gameEnded) {
        return; // 如果游戏已结束，直接返回
    }
    
    // 检查游戏结束条件
    if (checkGameOver()) return;
    
    // 触发随机事件
    await triggerRandomEvent();
    updateUI();
}

// 触发随机冲突事件
async function triggerRandomEvent() {
    // 过滤出可以触发的事件（必要角色都在团队中）
    const availableEvents = conflictEvents.filter(event => {
        // 检查是否所有必要角色都在团队中
        return event.requiredMembers.every(member => gameState.teamMembers[member]);
    });
    
    console.log('=== 触发随机事件 ===');
    console.log('可用事件数量:', availableEvents.length, '/', conflictEvents.length);
    console.log('过滤掉的事件:', conflictEvents.length - availableEvents.length);
    
    if (availableEvents.length === 0) {
        console.log('警告：没有可用的冲突事件！');
        // 如果没有可用事件，直接进入下个月
        setTimeout(async () => {
            await showContinueButton();
        }, 1000);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    gameState.currentEvent = availableEvents[randomIndex];
    
    console.log('选中事件:', gameState.currentEvent.title);
    console.log('必要角色:', gameState.currentEvent.requiredMembers);
    console.log('===================');
    
    await displayEvent(gameState.currentEvent);
}

// 显示事件
async function displayEvent(event) {
    document.getElementById('event-title').textContent = event.title;
    
    // 根据团队成员状态生成动态描述
    let dynamicDescription = generateEventDescription(event.descriptionTemplate);
    document.getElementById('event-description').innerHTML = dynamicDescription;
    
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    event.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.onclick = () => makeChoice(index);
        choicesContainer.appendChild(button);
    });
    
    // 播放事件面板入场动画
    await playEventPanelEnterAnimation();
}

// 根据团队成员状态生成事件描述
function generateEventDescription(descriptionTemplate) {
    let html = `<div class="base-description">${descriptionTemplate.base}</div>`;
    
    // 角色名称映射
    const memberNames = {
        artist: '美术',
        programmer: '程序', 
        designer: '策划'
    };
    
    // 按优先级顺序添加成员反应
    const memberOrder = ['artist', 'programmer', 'designer'];
    
    console.log('=== 生成事件描述 ===');
    console.log('基础描述:', descriptionTemplate.base);
    
    let hasReactions = false;
    for (const member of memberOrder) {
        if (gameState.teamMembers[member] && descriptionTemplate.memberReactions[member]) {
            const speech = descriptionTemplate.memberReactions[member];
            // 更强大的文本清理：去掉各种格式的角色名称前缀
            // 匹配模式：角色名+动作描述+冒号，或者直接是角色名+冒号
            const cleanSpeech = speech
                .replace(/^[^"]*：/, '') // 去掉冒号之前的所有内容
                .replace(/^"/, '') // 去掉开头的引号
                .replace(/"$/, '') // 去掉结尾的引号
                .trim();
            
            html += `<div class="character-speech speech-${member}">
                        <div class="character-name-tag">${memberNames[member]}</div>
                        <div>"${cleanSpeech}"</div>
                     </div>`;
            hasReactions = true;
        }
    }
    
    // 如果没有成员反应，使用fallback描述
    if (!hasReactions) {
        html += `<div style="margin-top: 10px; font-style: italic; color: #6b7280;">${descriptionTemplate.fallback}</div>`;
    }
    
    console.log('生成的HTML长度:', html.length);
    console.log('包含角色反应:', hasReactions);
    console.log('===================');
    
    return html;
}

// 做出选择
async function makeChoice(choiceIndex) {
    const choice = gameState.currentEvent.choices[choiceIndex];
    const effects = choice.effects;
    
    console.log('=== 选择效果 ===');
    console.log('选择内容:', choice.text);
    console.log('原始效果:', effects);
    
    // 播放事件面板出场动画
    await playEventPanelExitAnimation();
    
    // 应用效果
    gameState.progress += effects.progress || 0;
    gameState.money += effects.money || 0;
    
    // 记录信心变化前的值
    const oldConfidence = {
        artist: gameState.teamConfidence.artist,
        programmer: gameState.teamConfidence.programmer,
        designer: gameState.teamConfidence.designer
    };
    
    // 只对还在团队中的成员应用信心变化效果
    if (gameState.teamMembers.artist && effects.artist) {
        gameState.teamConfidence.artist += effects.artist;
    }
    if (gameState.teamMembers.programmer && effects.programmer) {
        gameState.teamConfidence.programmer += effects.programmer;
    }
    if (gameState.teamMembers.designer && effects.designer) {
        gameState.teamConfidence.designer += effects.designer;
    }
    
    // 更新历史最大资金（只在正数时更新）
    if (gameState.money > gameState.maxMoney && gameState.money > 0) {
        gameState.maxMoney = gameState.money;
    }
    
    // 确保数值在合理范围内
    gameState.progress = Math.max(0, Math.min(100, gameState.progress));
    
    // 在负债模式下，金钱可以为负数
    if (!gameState.isInDebtMode) {
        gameState.money = Math.max(0, gameState.money);
    }
    
    gameState.teamConfidence.artist = Math.max(0, Math.min(60, gameState.teamConfidence.artist));
    gameState.teamConfidence.programmer = Math.max(0, Math.min(60, gameState.teamConfidence.programmer));
    gameState.teamConfidence.designer = Math.max(0, Math.min(60, gameState.teamConfidence.designer));
    
    // 打印信心变化详情
    console.log('=== 团队信心变化 ===');
    console.log('美术:', oldConfidence.artist, '->', gameState.teamConfidence.artist, 
                `(${gameState.teamMembers.artist ? '在团队中' : '已离开'})`);
    console.log('程序:', oldConfidence.programmer, '->', gameState.teamConfidence.programmer,
                `(${gameState.teamMembers.programmer ? '在团队中' : '已离开'})`);
    console.log('策划:', oldConfidence.designer, '->', gameState.teamConfidence.designer,
                `(${gameState.teamMembers.designer ? '在团队中' : '已离开'})`);
    console.log('当前资金:', gameState.money, '万', gameState.isInDebtMode ? '(负债模式)' : '(正常模式)');
    console.log('=================');
    
    // 检查是否有成员信心降到0并离开团队
    const teamStatus = checkTeamMemberStatus();
    if (teamStatus.gameEnded) {
        return; // 如果游戏已结束，直接返回
    }
    
    // 更新UI（但不更新角色形象）
    updateUIWithoutCharacters();
    
    // 检查是否有成员离队，如果有则延迟显示第一轮tips
    const tipsDelay = teamStatus.memberLeft ? 2400 : 0; // 如果有成员离队，延迟2.4秒显示tips
    
    setTimeout(() => {
        // 显示第一轮tips（资金和进度变化）
        showFirstTips(effects);
        
        // 1.8秒后同时播放角色入场动画和显示继续按钮
        setTimeout(async () => {
            // 同时执行角色入场动画和显示继续按钮
            if (!checkGameOver()) {
                await Promise.all([
                    playCharacterEnterAnimationWithoutImageUpdate(),
                    showContinueButton()
                ]);
            } else {
                await playCharacterEnterAnimationWithoutImageUpdate();
            }
            
            // 然后显示对话气泡
            await showCharacterBubbles(effects);
            
            // 气泡消失后只更新角色形象
            updateCharacterImages();
        }, 1800); // 等待第一轮tips结束
    }, tipsDelay);
}

// 检查团队成员状态，处理信心为0的成员离开团队
function checkTeamMemberStatus() {
    const memberNames = {
        artist: '美术',
        programmer: '程序', 
        designer: '策划'
    };
    
    console.log('=== 检查团队成员状态 ===');
    
    let memberLeft = false; // 标记是否有成员离队
    const leftMembers = []; // 记录离开的成员
    
    // 检查每个成员是否需要离开团队
    for (const [member, confidence] of Object.entries(gameState.teamConfidence)) {
        console.log(`${memberNames[member]}: 信心=${confidence}, 在团队=${gameState.teamMembers[member]}`);
        
        if (gameState.teamMembers[member] && confidence <= 0) {
            // 负债模式下，任何人信心为0立即结束游戏
            if (gameState.isInDebtMode) {
                console.log(`💀 负债模式下${memberNames[member]}信心归零，游戏立即失败！`);
                endGame(false, '游戏开发失败', `在负债的巨大压力下，${memberNames[member]}的信心彻底崩溃，选择离开团队。项目无法继续进行。负债模式下团队承受的压力果然是双倍的...`);
                return { gameEnded: true, memberLeft: false }; // 游戏结束
            } else {
                // 正常模式下，成员离开团队
                gameState.teamMembers[member] = false;
                leftMembers.push(member);
                console.log(`💔 ${memberNames[member]}离开了团队！`);
                memberLeft = true;
                
                // 显示成员离开的提示
                const tipsElement = document.getElementById('tips');
                const memberNameWithColor = `<span class="character-name-${member}">${memberNames[member]}</span>`;
                const memberLeftMessage = `${memberNameWithColor}因为信心严重不足选择离开了团队...`;
                tipsElement.innerHTML = memberLeftMessage;
                tipsElement.classList.add('show');
                
                setTimeout(() => {
                    tipsElement.classList.add('fade-out');
                    tipsElement.classList.remove('show');
                    
                    setTimeout(() => {
                        // 只有当tips内容仍然是成员离队消息时才清空
                        if (tipsElement.innerHTML === memberLeftMessage) {
                            tipsElement.innerHTML = '';
                        }
                        tipsElement.classList.remove('fade-out');
                    }, 300);
                }, 2000);
            }
        }
    }
    
    // 如果有成员离开团队，剩余成员的信心减少各自当前值的50%
    if (memberLeft && leftMembers.length > 0) {
        console.log('=== 成员离开影响剩余团队信心 ===');
        
        // 对还在团队中的每个成员，减少其信心的50%
        for (const [member, isInTeam] of Object.entries(gameState.teamMembers)) {
            if (isInTeam) { // 只影响还在团队中的成员
                const oldConfidence = gameState.teamConfidence[member];
                const newConfidence = Math.floor(oldConfidence * 0.5); // 减少50%，向下取整
                gameState.teamConfidence[member] = Math.max(0, newConfidence); // 确保不低于0
                
                console.log(`${memberNames[member]}信心受到冲击: ${oldConfidence} -> ${gameState.teamConfidence[member]} (减少50%)`);
            }
        }
        
        // 显示团队信心受影响的提示（在成员离开提示后显示）
        setTimeout(() => {
            const tipsElement = document.getElementById('tips');
            const leftMemberNames = leftMembers.map(member => memberNames[member]).join('和');
            const impactMessage = `${leftMemberNames}的离开让剩余团队成员的信心受到了严重冲击...`;
            tipsElement.innerHTML = impactMessage;
            tipsElement.classList.add('show');
            
            setTimeout(() => {
                tipsElement.classList.add('fade-out');
                tipsElement.classList.remove('show');
                
                setTimeout(() => {
                    if (tipsElement.innerHTML === impactMessage) {
                        tipsElement.innerHTML = '';
                    }
                    tipsElement.classList.remove('fade-out');
                }, 300);
            }, 2500); // 在成员离开提示显示2.5秒后显示
            
            console.log('================================');
        }, 2500); // 在成员离开提示显示2.5秒后显示
    }
    
    const remainingMembers = Object.values(gameState.teamMembers).filter(inTeam => inTeam);
    console.log(`剩余团队成员数量: ${remainingMembers.length}`);
    console.log('========================');
    
    return { gameEnded: false, memberLeft: memberLeft };
}

// 检查是否有成员离队
function checkIfMemberLeft() {
    const remainingMembers = Object.values(gameState.teamMembers).filter(inTeam => inTeam);
    return remainingMembers.length < Object.values(gameState.teamMembers).length;
}

// 显示Tips提示
function showTips(effects) {
    // 第1轮：显示项目进度和金钱变化
    showFirstTips(effects);
    
    // 2.5秒后显示第2轮：信心变化
    setTimeout(() => {
        showSecondTips(effects);
    }, 2500);
}

// 第1轮提示：项目进度和金钱变化
function showFirstTips(effects) {
    const tipsElement = document.getElementById('tips');
    let tipsText = '';
    
    const changes = [];
    if (effects.progress) {
        changes.push(`开发进度${effects.progress > 0 ? '+' : ''}${effects.progress}%`);
    }
    if (effects.money) {
        changes.push(`资金${effects.money > 0 ? '+' : ''}${effects.money}万`);
    }
    
    if (changes.length > 0) {
        tipsText = changes.join('，');
    } else {
        tipsText = '项目状态维持稳定';
    }
    
    tipsElement.textContent = tipsText;
    tipsElement.classList.add('show');
    
    // 1.5秒后开始淡出
    setTimeout(() => {
        tipsElement.classList.add('fade-out');
        tipsElement.classList.remove('show');
        
        // 淡出动画完成后清除内容
        setTimeout(() => {
            tipsElement.textContent = '';
            tipsElement.classList.remove('fade-out');
        }, 300);
    }, 1500);
}

// 第2轮提示：信心变化（模糊描述）
function showSecondTips(effects) {
    const tipsElement = document.getElementById('tips');
    
    // 分析所有角色的信心变化，但只包括还在团队中的角色
    const changes = [];
    if (effects.artist && gameState.teamMembers.artist) {
        changes.push({ name: '美术', change: effects.artist });
    }
    if (effects.programmer && gameState.teamMembers.programmer) {
        changes.push({ name: '程序', change: effects.programmer });
    }
    if (effects.designer && gameState.teamMembers.designer) {
        changes.push({ name: '策划', change: effects.designer });
    }
    
    if (changes.length > 0) {
        const tipsHtml = generateConfidenceSummary(changes);
        if (tipsHtml) {
            tipsElement.innerHTML = tipsHtml;
            tipsElement.classList.add('show');
            
            // 3秒后开始淡出
            setTimeout(() => {
                tipsElement.classList.add('fade-out');
                tipsElement.classList.remove('show');
                
                // 淡出动画完成后清除内容
                setTimeout(() => {
                    tipsElement.innerHTML = '';
                    tipsElement.classList.remove('fade-out');
                }, 300);
            }, 3000);
        }
    }
}

// 生成信心变化的总结描述
function generateConfidenceSummary(changes) {
    // 按变化方向分组
    const positive = changes.filter(c => c.change > 0);
    const negative = changes.filter(c => c.change < 0);
    
    const results = [];
    
    // 处理正面变化
    if (positive.length > 0) {
        const names = positive.map(c => c.name);
        results.push(formatNamesWithDescription(names, '对项目的信心提升了'));
    }
    
    // 处理负面变化
    if (negative.length > 0) {
        const names = negative.map(c => c.name);
        results.push(formatNamesWithDescription(names, '对项目的信心下降了'));
    }
    
    return results.join('，');
}

// 格式化角色名称和描述
function formatNamesWithDescription(names, description) {
    // 角色名称到CSS类的映射
    const nameToClass = {
        '美术': 'character-name-artist',
        '程序': 'character-name-programmer', 
        '策划': 'character-name-designer'
    };
    
    if (names.length === 1) {
        const coloredName = `<span class="${nameToClass[names[0]]}">${names[0]}</span>`;
        return coloredName + description;
    } else if (names.length === 2) {
        const coloredName1 = `<span class="${nameToClass[names[0]]}">${names[0]}</span>`;
        const coloredName2 = `<span class="${nameToClass[names[1]]}">${names[1]}</span>`;
        return coloredName1 + '和' + coloredName2 + description;
    } else {
        return '团队成员们' + description;
    }
}

// 显示继续按钮
async function showContinueButton() {
    const continueBtn = document.getElementById('start-btn');
    continueBtn.textContent = '继续开发';
    continueBtn.style.display = 'block';
    continueBtn.onclick = async () => {
        continueBtn.style.display = 'none';
        await nextMonth();
    };
    
    // 播放按钮入场动画
    await playButtonEnterAnimation();
}

// 检查游戏结束条件
function checkGameOver() {
    // 胜利条件：开发进度达到100%
    if (gameState.progress >= 100) {
        endGame(true, '恭喜！你成功完成了独立游戏的开发！', '在你的英明领导下，团队克服了重重困难，最终交付了一款优秀的独立游戏。你们的作品获得了玩家和业界的一致好评！');
        return true;
    }
    
    // 检查是否进入负债模式或失败
    if (gameState.money <= 0 && !gameState.isInDebtMode) {
        // 计算剩余团队成员数量
        const remainingMembers = Object.values(gameState.teamMembers).filter(inTeam => inTeam).length;
        
        if (remainingMembers === 3) {
            // 如果3人团队完整，进入负债模式
            gameState.isInDebtMode = true;
            console.log('💰 资金耗尽！进入负债模式，团队将承担更大压力...');
            
            // 显示负债模式弹窗
            showDebtModal();
            
            return false; // 不结束游戏，继续进行
        } else {
            // 如果团队不完整，直接失败
            endGame(false, '游戏开发失败', '工作室资金耗尽，且团队人手不足无法继续支撑开发。虽然游戏还未完成，但这次的经历让大家都学到了宝贵的经验。');
            return true;
        }
    }
    
    // 失败条件：所有团队成员都离开
    const remainingMembers = Object.values(gameState.teamMembers).filter(inTeam => inTeam);
    if (remainingMembers.length === 0) {
        endGame(false, '游戏开发失败', '所有团队成员都因为信心不足离开了团队，项目无法继续进行。作为领导者，维护团队士气和每个成员的状态同样重要。');
        return true;
    }
    
    return false;
}

// 结束游戏
function endGame(isVictory, title, message) {
    gameState.isGameOver = true;
    
    document.getElementById('game-content').classList.add('hidden');
    document.getElementById('event-section').classList.add('hidden');
    
    const gameOverElement = document.getElementById('game-over');
    const imageElement = document.getElementById('game-over-image');
    const titleElement = document.getElementById('game-over-title');
    const messageElement = document.getElementById('game-over-message');
    
    // 根据胜利或失败状态设置对应图片
    if (isVictory) {
        imageElement.src = 'img/img_result_win.png';
        titleElement.className = 'game-over-title victory';
    } else {
        imageElement.src = 'img/img_result_lose.png';
        titleElement.className = 'game-over-title defeat';
    }
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    gameOverElement.classList.remove('hidden');
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameState = {
        money: 500,
        maxMoney: 500,
        progress: 0,
        month: 6,
        year: 2025,
        teamConfidence: {
            artist: 60,
            programmer: 60,
            designer: 60
        },
        teamMembers: {
            artist: true,
            programmer: true,
            designer: true
        },
        isInDebtMode: false,
        isGameOver: false,
        currentEvent: null,
        isIntroShown: true // 重新开始时回到介绍页面
    };
    
    // 重置UI
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('event-section').classList.add('hidden');
    document.getElementById('debt-modal').classList.add('hidden');
    document.getElementById('tips').classList.remove('show', 'fade-out');
    document.getElementById('tips').innerHTML = '';
    
    // 重置"开始开发"按钮状态
    const startBtn = document.getElementById('start-btn');
    startBtn.style.display = 'block';
    startBtn.textContent = '开始开发';
    
    // 清除game-content上的所有动画类，防止按钮播放出场动画
    const gameContent = document.getElementById('game-content');
    gameContent.classList.remove('exit-down', 'enter-up');
    
    // 显示介绍页面，隐藏游戏UI
    hideGameUI();
    document.getElementById('intro-screen').classList.remove('hidden');
    
    // 强制重置所有角色的显示状态
    Object.keys(characterConfig).forEach(member => {
        const element = document.getElementById(characterConfig[member].element);
        const labelElement = document.getElementById(characterConfig[member].labelElement);
        const wrapper = element.parentElement;
        
        // 清除所有可能的动画类和位置类
        wrapper.classList.remove('hidden', 'position-left', 'position-center', 'position-right', 
                                  'exit-left', 'exit-right', 'exit-center',
                                  'enter-left', 'enter-right', 'enter-center');
        element.classList.remove('hidden');
        labelElement.classList.remove('hidden');
    });
    
    // 预加载角色图片
    updateCharacterDisplay();
    updateUI();
    
    // 确保角色显示在介绍页面时也正确重置
    setTimeout(() => {
        updateCharacterDisplay();
    }, 100);
}

// 初始化游戏
function initGame() {
    // 初始化时显示介绍页面，隐藏游戏UI
    if (gameState.isIntroShown) {
        hideGameUI();
        document.getElementById('intro-screen').classList.remove('hidden');
    } else {
        showGameUI();
        document.getElementById('intro-screen').classList.add('hidden');
    }
    
    // 预加载角色图片和更新UI
    updateCharacterDisplay();
    updateUI();
    
    // Debug功能说明
    console.log('🎮 独立游戏开发模拟器 Debug 模式');
    console.log('按键说明:');
    console.log('  Q - 美术信心 -50');
    console.log('  W - 程序信心 -50'); 
    console.log('  E - 策划信心 -50');
    console.log('  U - 减少100万资金');
    console.log('  I - 增加20%进度');
    console.log('');
    console.log('💰 负债模式说明:');
    console.log('  - 当资金为0且团队完整(3人)时进入负债模式');
    console.log('  - 负债模式下每月扣除所有人5%信心而非金钱');
    console.log('  - 负债模式下任何人信心为0立即失败');
    console.log('  - 冲突事件选项仍然生效，金钱可为负数');
    console.log('');
    console.log('所有团队变化都会在控制台中显示详细信息');
    console.log('====================================');
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

// Debug功能：键盘监听
document.addEventListener('keydown', function(event) {
    // 只在游戏进行中才允许debug
    if (gameState.isGameOver) return;
    
    switch(event.key.toLowerCase()) {
        case 'q':
            // 美术信心减少50
            if (gameState.teamMembers.artist) {
                const oldValue = gameState.teamConfidence.artist;
                gameState.teamConfidence.artist = Math.max(0, gameState.teamConfidence.artist - 50);
                console.log('DEBUG: 美术信心', oldValue, '->', gameState.teamConfidence.artist);
                const teamStatus = checkTeamMemberStatus();
                if (teamStatus.gameEnded) return; // 如果游戏已结束，直接返回
                updateUI();
            }
            break;
        case 'w':
            // 程序信心减少50
            if (gameState.teamMembers.programmer) {
                const oldValue = gameState.teamConfidence.programmer;
                gameState.teamConfidence.programmer = Math.max(0, gameState.teamConfidence.programmer - 50);
                console.log('DEBUG: 程序信心', oldValue, '->', gameState.teamConfidence.programmer);
                const teamStatus = checkTeamMemberStatus();
                if (teamStatus.gameEnded) return; // 如果游戏已结束，直接返回
                updateUI();
            }
            break;
        case 'e':
            // 策划信心减少50
            if (gameState.teamMembers.designer) {
                const oldValue = gameState.teamConfidence.designer;
                gameState.teamConfidence.designer = Math.max(0, gameState.teamConfidence.designer - 50);
                console.log('DEBUG: 策划信心', oldValue, '->', gameState.teamConfidence.designer);
                const teamStatus = checkTeamMemberStatus();
                if (teamStatus.gameEnded) return; // 如果游戏已结束，直接返回
                updateUI();
            }
            break;
        case 'u':
            // 减少100万资金
            const oldMoney = gameState.money;
            gameState.money -= 100;
            console.log('DEBUG: 资金', oldMoney, '->', gameState.money, '万 (减少100万)');
            
            // 检查是否因此进入负债模式或游戏结束
            if (checkGameOver()) return;
            updateUI();
            break;
        case 'i':
            // 增加20%进度
            const oldProgress = gameState.progress;
            gameState.progress = Math.min(100, gameState.progress + 20);
            console.log('DEBUG: 开发进度', oldProgress + '%', '->', gameState.progress + '%', '(增加20%)');
            
            // 检查是否因此达到胜利条件
            if (checkGameOver()) return;
            updateUI();
            break;
    }
});

// 动画控制函数
function playCharacterExitAnimation() {
    return new Promise((resolve) => {
        const activeMembers = Object.keys(gameState.teamMembers).filter(member => gameState.teamMembers[member]);
        
        // 获取当前显示的角色元素
        activeMembers.forEach(member => {
            const config = characterConfig[member];
            const wrapper = document.getElementById(config.element).parentElement;
            
            // 根据位置添加相应的出场动画
            if (wrapper.classList.contains('position-left')) {
                wrapper.classList.add('exit-left');
            } else if (wrapper.classList.contains('position-right')) {
                wrapper.classList.add('exit-right');
            } else if (wrapper.classList.contains('position-center')) {
                wrapper.classList.add('exit-center');
            }
        });
        
        // 按钮下滑出场
        const gameContent = document.getElementById('game-content');
        gameContent.classList.add('exit-down');
        
        // 0.5秒后完成出场动画
        setTimeout(resolve, 500);
    });
}

function playCharacterEnterAnimation() {
    return new Promise((resolve) => {
        // 更新角色显示（包括图片切换）
        updateCharacterDisplay();
        
        const activeMembers = Object.keys(gameState.teamMembers).filter(member => gameState.teamMembers[member]);
        
        // 清除之前的动画类并添加入场动画
        activeMembers.forEach(member => {
            const config = characterConfig[member];
            const wrapper = document.getElementById(config.element).parentElement;
            
            // 清除出场动画类
            wrapper.classList.remove('exit-left', 'exit-right', 'exit-center');
            
            // 根据位置添加相应的入场动画
            if (wrapper.classList.contains('position-left')) {
                wrapper.classList.add('enter-left');
            } else if (wrapper.classList.contains('position-right')) {
                wrapper.classList.add('enter-right');
            } else if (wrapper.classList.contains('position-center')) {
                wrapper.classList.add('enter-center');
            }
        });
        
        // 0.5秒后完成入场动画
        setTimeout(() => {
            // 清除入场动画类
            activeMembers.forEach(member => {
                const config = characterConfig[member];
                const wrapper = document.getElementById(config.element).parentElement;
                wrapper.classList.remove('enter-left', 'enter-right', 'enter-center');
            });
            resolve();
        }, 500);
    });
}

function playCharacterEnterAnimationWithoutImageUpdate() {
    return new Promise((resolve) => {
        // 更新角色位置显示（但不更新图片）
        updateCharacterPositions();
        
        const activeMembers = Object.keys(gameState.teamMembers).filter(member => gameState.teamMembers[member]);
        
        // 清除之前的动画类并添加入场动画
        activeMembers.forEach(member => {
            const config = characterConfig[member];
            const wrapper = document.getElementById(config.element).parentElement;
            
            // 清除出场动画类
            wrapper.classList.remove('exit-left', 'exit-right', 'exit-center');
            
            // 根据位置添加相应的入场动画
            if (wrapper.classList.contains('position-left')) {
                wrapper.classList.add('enter-left');
            } else if (wrapper.classList.contains('position-right')) {
                wrapper.classList.add('enter-right');
            } else if (wrapper.classList.contains('position-center')) {
                wrapper.classList.add('enter-center');
            }
        });
        
        // 0.5秒后完成入场动画
        setTimeout(() => {
            // 清除入场动画类
            activeMembers.forEach(member => {
                const config = characterConfig[member];
                const wrapper = document.getElementById(config.element).parentElement;
                wrapper.classList.remove('enter-left', 'enter-right', 'enter-center');
            });
            resolve();
        }, 500);
    });
}

function playEventPanelEnterAnimation() {
    return new Promise((resolve) => {
        // 先触发屏幕震动效果
        const gameContainer = document.querySelector('.game-container');
        gameContainer.classList.add('shake');
        
        // 震动完成后移除震动类
        setTimeout(() => {
            gameContainer.classList.remove('shake');
        }, 300);
        
        // 震动0.2秒后开始弹窗动画
        setTimeout(() => {
            const eventPanel = document.getElementById('event-section');
            eventPanel.classList.remove('hidden');
            eventPanel.classList.add('enter-scale');
            
            // 0.8秒后完成入场动画
            setTimeout(() => {
                eventPanel.classList.remove('enter-scale');
                resolve();
            }, 800);
        }, 200);
    });
}

function playEventPanelExitAnimation() {
    return new Promise((resolve) => {
        const eventPanel = document.getElementById('event-section');
        eventPanel.classList.add('exit-scale');
        
        // 0.5秒后完成出场动画
        setTimeout(() => {
            eventPanel.classList.remove('exit-scale');
            eventPanel.classList.add('hidden');
            resolve();
        }, 500);
    });
}

function playButtonEnterAnimation() {
    return new Promise((resolve) => {
        const gameContent = document.getElementById('game-content');
        gameContent.classList.remove('hidden', 'exit-down');
        gameContent.classList.add('enter-up');
        
        // 0.5秒后完成入场动画
        setTimeout(() => {
            gameContent.classList.remove('enter-up');
            resolve();
        }, 500);
    });
}

// 开始游戏（从介绍页面进入游戏）
function startGame() {
    // 隐藏介绍页面
    document.getElementById('intro-screen').classList.add('hidden');
    
    // 显示游戏UI
    gameState.isIntroShown = false;
    showGameUI();
    
    // 确保"开始开发"按钮显示
    const startBtn = document.getElementById('start-btn');
    startBtn.style.display = 'block';
    startBtn.textContent = '开始开发';
    
    // 清除game-content上的所有动画类，确保按钮正常显示
    const gameContent = document.getElementById('game-content');
    gameContent.classList.remove('exit-down', 'enter-up', 'hidden');
    
    // 更新角色显示
    updateCharacterDisplay();
    
    console.log('🎮 游戏开始！');
}

// 显示游戏UI
function showGameUI() {
    document.getElementById('game-content').classList.remove('hidden');
    document.querySelector('.status-bar').classList.remove('hidden');
    document.querySelector('.characters-container').classList.remove('intro-hidden');
}

// 隐藏游戏UI
function hideGameUI() {
    document.getElementById('game-content').classList.add('hidden');
    document.querySelector('.status-bar').classList.add('hidden');
    document.querySelector('.characters-container').classList.add('intro-hidden');
}

// 显示负债模式弹窗
function showDebtModal() {
    document.getElementById('debt-modal').classList.remove('hidden');
}

// 关闭负债模式弹窗
function closeDebtModal() {
    document.getElementById('debt-modal').classList.add('hidden');
} 