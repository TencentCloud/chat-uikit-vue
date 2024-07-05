/**
 * Emoji input interface in the chat screen.
 * In respect for the copyright of the emoji design, the Chat Demo/TUIKit project does not include the cutouts of large emoji elements.
 * Please replace them with your own designed or copyrighted emoji packs before the official launch for commercial use.
 * The default small yellow face emoji pack is copyrighted by Tencent Cloud and can be authorized for a fee.
 * If you wish to obtain authorization, please submit a ticket to contact us.
 *
 * submit a ticket url：https://console.tencentcloud.com/workorder/category?level1_id=29&level2_id=40&source=14&data_title=Chat&step=1
 */
import { default as emojiCNLocales } from './locales/zh_cn';
import { default as emojiENLocales } from './locales/en';
import { EMOJI_TYPE } from '../../../constant';
import { IEmojiGroupList } from '../../../interface';

export const DEFAULT_BASIC_EMOJI_URL = 'https://web.sdk.qcloud.com/im/assets/emoji-plugin/';
export const DEFAULT_BIG_EMOJI_URL = 'https://web.sdk.qcloud.com/im/assets/face-elem/';

export const DEFAULT_BASIC_EMOJI_URL_MAPPING: Record<string, string> = {
  '[TUIEmoji_Expect]': 'emoji_0@2x.png',
  '[TUIEmoji_Blink]': 'emoji_1@2x.png',
  '[TUIEmoji_Guffaw]': 'emoji_2@2x.png',
  '[TUIEmoji_KindSmile]': 'emoji_3@2x.png',
  '[TUIEmoji_Haha]': 'emoji_4@2x.png',
  '[TUIEmoji_Cheerful]': 'emoji_5@2x.png',
  '[TUIEmoji_Smile]': 'emoji_6@2x.png',
  '[TUIEmoji_Sorrow]': 'emoji_7@2x.png',
  '[TUIEmoji_Speechless]': 'emoji_8@2x.png',
  '[TUIEmoji_Amazed]': 'emoji_9@2x.png',
  '[TUIEmoji_Complacent]': 'emoji_10@2x.png',
  '[TUIEmoji_Lustful]': 'emoji_11@2x.png',
  '[TUIEmoji_Stareyes]': 'emoji_12@2x.png',
  '[TUIEmoji_Giggle]': 'emoji_13@2x.png',
  '[TUIEmoji_Daemon]': 'emoji_14@2x.png',
  '[TUIEmoji_Rage]': 'emoji_15@2x.png',
  '[TUIEmoji_Yawn]': 'emoji_16@2x.png',
  '[TUIEmoji_TearsLaugh]': 'emoji_17@2x.png',
  '[TUIEmoji_Silly]': 'emoji_18@2x.png',
  '[TUIEmoji_Wail]': 'emoji_19@2x.png',
  '[TUIEmoji_Kiss]': 'emoji_20@2x.png',
  '[TUIEmoji_Trapped]': 'emoji_21@2x.png',
  '[TUIEmoji_Fear]': 'emoji_22@2x.png',
  '[TUIEmoji_BareTeeth]': 'emoji_23@2x.png',
  '[TUIEmoji_FlareUp]': 'emoji_24@2x.png',
  '[TUIEmoji_Tact]': 'emoji_25@2x.png',
  '[TUIEmoji_Shit]': 'emoji_26@2x.png',
  '[TUIEmoji_ShutUp]': 'emoji_27@2x.png',
  '[TUIEmoji_Sigh]': 'emoji_28@2x.png',
  '[TUIEmoji_Hehe]': 'emoji_29@2x.png',
  '[TUIEmoji_Silent]': 'emoji_30@2x.png',
  '[TUIEmoji_Skull]': 'emoji_31@2x.png',
  '[TUIEmoji_Mask]': 'emoji_32@2x.png',
  '[TUIEmoji_Beer]': 'emoji_33@2x.png',
  '[TUIEmoji_Cake]': 'emoji_34@2x.png',
  '[TUIEmoji_RedPacket]': 'emoji_35@2x.png',
  '[TUIEmoji_Bombs]': 'emoji_36@2x.png',
  '[TUIEmoji_Ai]': 'emoji_37@2x.png',
  '[TUIEmoji_Celebrate]': 'emoji_38@2x.png',
  '[TUIEmoji_Bless]': 'emoji_39@2x.png',
  '[TUIEmoji_Flower]': 'emoji_40@2x.png',
  '[TUIEmoji_Watermelon]': 'emoji_41@2x.png',
  '[TUIEmoji_Cow]': 'emoji_42@2x.png',
  '[TUIEmoji_Fool]': 'emoji_43@2x.png',
  '[TUIEmoji_Surprised]': 'emoji_44@2x.png',
  '[TUIEmoji_Askance]': 'emoji_45@2x.png',
  '[TUIEmoji_Monster]': 'emoji_46@2x.png',
  '[TUIEmoji_Pig]': 'emoji_47@2x.png',
  '[TUIEmoji_Coffee]': 'emoji_48@2x.png',
  '[TUIEmoji_Ok]': 'emoji_49@2x.png',
  '[TUIEmoji_Heart]': 'emoji_50@2x.png',
  '[TUIEmoji_Sun]': 'emoji_51@2x.png',
  '[TUIEmoji_Moon]': 'emoji_52@2x.png',
  '[TUIEmoji_Star]': 'emoji_53@2x.png',
  '[TUIEmoji_Rich]': 'emoji_54@2x.png',
  '[TUIEmoji_Fortune]': 'emoji_55@2x.png',
  '[TUIEmoji_857]': 'emoji_56@2x.png',
  '[TUIEmoji_666]': 'emoji_57@2x.png',
  '[TUIEmoji_Prohibit]': 'emoji_58@2x.png',
  '[TUIEmoji_Convinced]': 'emoji_59@2x.png',
  '[TUIEmoji_Knife]': 'emoji_60@2x.png',
  '[TUIEmoji_Like]': 'emoji_61@2x.png',
};

export const BIG_EMOJI_GROUP_LIST: IEmojiGroupList = [
  {
    emojiGroupID: 1,
    type: EMOJI_TYPE.BIG,
    url: DEFAULT_BIG_EMOJI_URL,
    list: ['yz00', 'yz01', 'yz02', 'yz03', 'yz04', 'yz05', 'yz06', 'yz07', 'yz08',
      'yz09', 'yz10', 'yz11', 'yz12', 'yz13', 'yz14', 'yz15', 'yz16', 'yz17'],
  },
  {
    emojiGroupID: 2,
    type: EMOJI_TYPE.BIG,
    url: DEFAULT_BIG_EMOJI_URL,
    list: ['ys00', 'ys01', 'ys02', 'ys03', 'ys04', 'ys05', 'ys06', 'ys07', 'ys08',
      'ys09', 'ys10', 'ys11', 'ys12', 'ys13', 'ys14', 'ys15'],
  },
  {
    emojiGroupID: 3,
    type: EMOJI_TYPE.BIG,
    url: DEFAULT_BIG_EMOJI_URL,
    list: ['gcs00', 'gcs01', 'gcs02', 'gcs03', 'gcs04', 'gcs05', 'gcs06', 'gcs07',
      'gcs08', 'gcs09', 'gcs10', 'gcs11', 'gcs12', 'gcs13', 'gcs14', 'gcs15', 'gcs16'],
  },
];

export const BASIC_EMOJI_NAME_TO_KEY_MAPPING = {
  ...Object.fromEntries(
    Object.entries(emojiCNLocales)?.map(([key, val]) => [val, key]),
  ),
  ...Object.fromEntries(
    Object.entries(emojiENLocales)?.map(([key, val]) => [val, key]),
  ),
};
