import svgPaths from "./svg-sku2zuchb5";

function Icon() {
  return (
    <div className="h-[23.98px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_8.33%_16.67%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5.88%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9819 18.9844">
            <path d={svgPaths.p2b0c2100} id="Vector" stroke="var(--stroke-0, #53BEE8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[39.953px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[7.986px] px-[7.986px] relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[27.002px] left-[0.07px] top-[8px] w-[131.944px]" data-name="Heading 3">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[27px] left-0 text-[#404040] text-[18px] text-nowrap top-[-1.65px]">未整理</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[42.995px] relative shrink-0 w-[131.944px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[42.995px] relative shrink-0 w-[183.877px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.98px] items-center relative size-full">
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20.008px] relative shrink-0 w-[8.219px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#d9d9d9] text-[14px] text-nowrap">0</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[19.987px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9871 19.9871">
        <g id="Icon">
          <path d={svgPaths.p83a7740} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66559" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[20.008px] relative shrink-0 w-[36.192px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.986px] items-center relative size-full">
        <Text />
        <Icon1 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex h-[43px] items-center justify-between left-[20px] top-[4px] w-[322px]" data-name="Container">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Separator() {
  return (
    <div className="absolute h-px left-1/2 top-0 translate-x-[-50%] w-[322px]" data-name="_Separator">
      <div aria-hidden="true" className="absolute border-[#e6e6e6] border-[1px_0px_0px] border-solid inset-[-1px_0_0_0] pointer-events-none" />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute h-[52px] left-0 top-[40px] w-[362px]" data-name="Button">
      <Container4 />
      <Separator />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[23.98px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_8.33%_16.67%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5.88%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9819 18.9844">
            <path d={svgPaths.p2b0c2100} id="Vector" stroke="var(--stroke-0, #53BEE8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[39.953px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[7.986px] px-[7.986px] relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[27.002px] relative shrink-0 w-[68.222px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[27px] left-0 text-[#404040] text-[18px] text-nowrap top-[-1.65px]">JLPT N4</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[39.953px] relative shrink-0 w-[120.155px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.98px] items-center relative size-full">
        <Container5 />
        <Heading2 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20.008px] relative shrink-0 w-[8.219px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#d9d9d9] text-[14px] text-nowrap">1</p>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[19.987px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9871 19.9871">
        <g id="Icon">
          <path d={svgPaths.p83a7740} id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66559" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[20.008px] relative shrink-0 w-[36.192px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.986px] items-center relative size-full">
        <Text1 />
        <Icon3 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex h-[40px] items-center justify-between left-[20px] top-[6px] w-[322px]" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Separator1() {
  return (
    <div className="absolute h-px left-1/2 top-0 translate-x-[-50%] w-[322px]" data-name="_Separator">
      <div aria-hidden="true" className="absolute border-[#e6e6e6] border-[1px_0px_0px] border-solid inset-[-1px_0_0_0] pointer-events-none" />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute h-[52px] left-0 rounded-[10px] top-[92px] w-[362px]" data-name="Button">
      <Container8 />
      <Separator1 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[23.98px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_8.33%_16.67%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5.88%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9819 18.9844">
            <path d={svgPaths.p2b0c2100} id="Vector" stroke="var(--stroke-0, #53BEE8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[39.953px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[7.986px] px-[7.986px] relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[27.002px] relative shrink-0 w-[68.222px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[27px] left-0 text-[#404040] text-[18px] text-nowrap top-[-1.65px]">JLPT N5</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[39.953px] relative shrink-0 w-[120.155px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.98px] items-center relative size-full">
        <Container9 />
        <Heading3 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[20.008px] relative shrink-0 w-[8.219px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#d9d9d9] text-[14px] text-nowrap">2</p>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[19.987px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9871 19.9871">
        <g id="Icon">
          <path d={svgPaths.p83a7740} id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66559" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[20.008px] relative shrink-0 w-[36.192px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.986px] items-center relative size-full">
        <Text2 />
        <Icon5 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex h-[52px] items-center justify-between left-0 top-0 w-[322px]" data-name="Container">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Separator2() {
  return (
    <div className="absolute h-px left-1/2 top-0 translate-x-[-50%] w-[322px]" data-name="_Separator">
      <div aria-hidden="true" className="absolute border-[#e6e6e6] border-[1px_0px_0px] border-solid inset-[-1px_0_0_0] pointer-events-none" />
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[52px] left-[20px] rounded-[10px] top-[144px] w-[322px]" data-name="Button">
      <Container12 />
      <Separator2 />
    </div>
  );
}

function WordListScreen() {
  return (
    <div className="absolute h-[21px] left-0 top-[559px] w-[362px]" data-name="WordListScreen">
      <p className="absolute font-['SF_Pro:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[16px] left-[193px] text-[#d9d9d9] text-[12px] text-center top-[3px] translate-x-[-50%] w-[100px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        総単語数: 3
      </p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bg-white h-[598px] left-[calc(50%-0.5px)] rounded-[26px] top-[84px] translate-x-[-50%] w-[362px]" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <WordListScreen />
    </div>
  );
}

function WordListScreen1() {
  return (
    <div className="absolute bg-[#f2f2f7] h-[812px] left-0 top-0 w-[403px]" data-name="WordListScreen">
      <Container13 />
    </div>
  );
}

function Mask() {
  return (
    <div className="absolute bg-white inset-[-50px]" data-name="Mask">
      <div className="absolute bg-black inset-[76px] rounded-[100px]" data-name="Shape" />
    </div>
  );
}

function Blur() {
  return <div className="absolute backdrop-blur-2xl backdrop-filter bg-[rgba(0,0,0,0.08)] blur-[20px] filter inset-[31px_26px_21px_26px] mix-blend-hard-light rounded-[100px]" data-name="Blur" />;
}

function Shadow() {
  return (
    <div className="absolute inset-[-26px]" data-name="Shadow">
      <Mask />
      <Blur />
    </div>
  );
}

function GlassEffect() {
  return <div className="absolute bg-[rgba(255,255,255,0.07)] inset-0 mix-blend-screen rounded-[100px]" data-name="Glass Effect" />;
}

function ClearGlass() {
  return (
    <div className="absolute inset-[-10.42%]" data-name="Clear Glass">
      <Shadow />
      <GlassEffect />
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[12px] size-[23.98px] top-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9803 23.9803">
        <g id="Icon">
          <path d={svgPaths.p268df100} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          <path d={svgPaths.pf9c70a0} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          <path d={svgPaths.p1e055040} id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
        </g>
      </svg>
    </div>
  );
}

function Leading() {
  return (
    <div className="absolute left-1/2 size-[48px] top-[calc(50%+1px)] translate-x-[-50%] translate-y-[-50%]" data-name="Leading">
      <ClearGlass />
      <Icon6 />
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[48px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Leading />
      </div>
    </div>
  );
}

function Heading() {
  return <div className="absolute left-0 size-0 top-[47.94px]" data-name="Heading 1" />;
}

function Container14() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-center left-[12px] size-[48px] top-[-8px]" data-name="Container">
      <Button3 />
      <Heading />
    </div>
  );
}

function Mask1() {
  return (
    <div className="absolute bg-white inset-[-50px]" data-name="Mask">
      <div className="absolute bg-black inset-[76px] rounded-[100px]" data-name="Shape" />
    </div>
  );
}

function Blur1() {
  return <div className="absolute backdrop-blur-2xl backdrop-filter bg-[rgba(0,0,0,0.08)] blur-[20px] filter inset-[31px_26px_21px_26px] mix-blend-hard-light rounded-[100px]" data-name="Blur" />;
}

function Shadow1() {
  return (
    <div className="absolute inset-[-26px]" data-name="Shadow">
      <Mask1 />
      <Blur1 />
    </div>
  );
}

function GlassEffect1() {
  return <div className="absolute bg-[rgba(255,255,255,0.07)] inset-0 mix-blend-screen rounded-[100px]" data-name="Glass Effect" />;
}

function ClearGlass1() {
  return (
    <div className="absolute inset-[-10.42%]" data-name="Clear Glass">
      <Shadow1 />
      <GlassEffect1 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[14px] size-[19.987px] top-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9871 19.9871">
        <g clipPath="url(#clip0_79_337)" id="Icon">
          <path d="M9.99355 8.32796V13.3247" id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66559" />
          <path d="M7.49516 10.8263H12.4919" id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66559" />
          <path d={svgPaths.p32b2e400} id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66559" />
        </g>
        <defs>
          <clipPath id="clip0_79_337">
            <rect fill="white" height="19.9871" width="19.9871" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute left-[317px] rounded-[10px] size-[48px] top-0" data-name="Button">
      <ClearGlass1 />
      <Icon7 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[44px] left-[calc(50%-0.48px)] top-[calc(50%+0.04px)] translate-x-[-50%] translate-y-[-50%] w-[362px]" data-name="Container">
      <Container14 />
      <Button4 />
    </div>
  );
}

function WordListScreen2() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[79.927px] left-0 rounded-bl-[10px] rounded-br-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-0 w-[402.953px]" data-name="WordListScreen">
      <Container15 />
    </div>
  );
}

function Mask2() {
  return (
    <div className="absolute bg-white inset-[-50px]" data-name="Mask">
      <div className="absolute bg-black inset-[76px] rounded-[24px]" data-name="Shape" />
    </div>
  );
}

function Blur2() {
  return <div className="absolute backdrop-blur-2xl backdrop-filter bg-[rgba(0,0,0,0.08)] blur-[20px] filter inset-[31px_26px_21px_26px] mix-blend-hard-light rounded-[24px]" data-name="Blur" />;
}

function Shadow2() {
  return (
    <div className="absolute inset-[-26px]" data-name="Shadow">
      <Mask2 />
      <Blur2 />
    </div>
  );
}

function GlassEffect2() {
  return <div className="absolute bg-[rgba(255,255,255,0.07)] inset-0 mix-blend-screen rounded-[24px]" data-name="Glass Effect" />;
}

function NotificationCollapsed() {
  return (
    <div className="absolute content-stretch flex gap-[10px] h-[64px] items-center justify-center left-[16px] pl-[14px] pr-[17px] py-[13px] rounded-[24px] top-[33px] w-[386px]" data-name="Notification - Collapsed">
      <Shadow2 />
      <GlassEffect2 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[23.98px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9803 23.9803">
        <g id="Icon">
          <path d={svgPaths.p20084fe0} id="Vector" stroke="var(--stroke-0, #53BEE8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          <path d={svgPaths.p260e96b2} id="Vector_2" stroke="var(--stroke-0, #53BEE8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="basis-0 grow h-[63.997px] min-h-px min-w-px relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[23.98px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9803 23.9803">
        <g id="Icon">
          <path d={svgPaths.p27e55d00} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          <path d={svgPaths.p14ccae80} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="basis-0 grow h-[63.997px] min-h-px min-w-px relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[23.98px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9803 23.9803">
        <g id="Icon">
          <path d={svgPaths.p3cd3f400} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          <path d="M1.99836 9.99179H21.9819" id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="basis-0 grow h-[63.997px] min-h-px min-w-px relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative size-full">
        <Icon10 />
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[23.98px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9803 23.9803">
        <g id="Icon">
          <path d="M4.99589 11.9901H18.9844" id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
          <path d="M11.9901 4.99589V18.9844" id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99836" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="basis-0 grow h-[63.997px] min-h-px min-w-px relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative size-full">
        <Icon11 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex h-[63.997px] items-center justify-between left-[8px] top-[33px] w-[402.953px]" data-name="Container">
      <Button5 />
      <Button6 />
      <Button7 />
      <Button8 />
    </div>
  );
}

function Navigation() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[140px] left-1/2 top-[674px] translate-x-[-50%] w-[402px]" data-name="Navigation">
      <NotificationCollapsed />
      <Container16 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white relative size-full" data-name="1">
      <WordListScreen1 />
      <WordListScreen2 />
      <Navigation />
    </div>
  );
}