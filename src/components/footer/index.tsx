import React from "react";

const Footer = () => {
  return (
    <footer className="w-full">
      <div className="container p-4 sm:p-6 flex flex-col items-center justify-center gap-1">
        <h3 className="font-bold">
          Quizmasters Hub
        </h3>

        <p className="text-sm">
          Made with 💚
        </p>

        <div className="mt-3 flex items-center gap-6">
          {socials.map(({ href, Logo }, i) => (
            <a className="duration-200 hover:opacity-50" href={href} key={i}>
              {Logo}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

const socials = [
  {
    Logo: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 stroke-foreground !fill-foreground"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
    href: "https://github.com/SarathAdhi",
  },
  {
    Logo: (
      <svg
        width="19"
        height="16"
        viewBox="0 0 19 16"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 stroke-foreground !fill-foreground"
      >
        <path d="M12.8766 0.261298V0.258057H13.7206L14.029 0.319649C14.2346 0.359635 14.4213 0.412037 14.589 0.47687C14.7567 0.541704 14.919 0.617348 15.0759 0.703788C15.2328 0.790227 15.3751 0.878304 15.5028 0.967985C15.6294 1.0566 15.743 1.15061 15.8436 1.25001C15.9432 1.3505 16.0985 1.37644 16.3095 1.32781C16.5205 1.27919 16.7477 1.21165 16.9911 1.12521C17.2346 1.03877 17.4754 0.941517 17.7134 0.833455C17.9515 0.725394 18.0965 0.656783 18.1484 0.627608C18.1993 0.597363 18.2263 0.581155 18.2296 0.578983L18.2328 0.574121L18.249 0.566016L18.2653 0.557912L18.2815 0.549808L18.2977 0.541704L18.301 0.536841L18.3058 0.5336L18.3107 0.530358L18.314 0.525495L18.3302 0.520633L18.3464 0.517391L18.3432 0.541704L18.3383 0.566016L18.3302 0.590329L18.3221 0.614642L18.314 0.63085L18.3058 0.647058L18.2977 0.671371C18.2923 0.687579 18.2869 0.709185 18.2815 0.736205C18.2761 0.763224 18.2247 0.871269 18.1273 1.06037C18.0299 1.24948 17.9082 1.44127 17.7621 1.63577C17.616 1.83027 17.4851 1.97722 17.3693 2.07664C17.2525 2.17713 17.1751 2.24736 17.1372 2.28735C17.0994 2.32841 17.0534 2.36622 16.9993 2.40081L16.9181 2.4543L16.9019 2.4624L16.8856 2.4705L16.8824 2.47537L16.8775 2.47861L16.8727 2.48185L16.8694 2.48671L16.8532 2.49482L16.837 2.50292L16.8337 2.50778L16.8288 2.51103L16.824 2.51427L16.8207 2.51913L16.8175 2.52399L16.8126 2.52723L16.8077 2.53048L16.8045 2.53534H16.8856L17.3401 2.43809C17.6431 2.37325 17.9325 2.29492 18.2085 2.20307L18.6467 2.05719L18.6954 2.04098L18.7197 2.03288L18.736 2.02477L18.7522 2.01667L18.7684 2.00856L18.7847 2.00046L18.8171 1.9956L18.8496 1.99236V2.02477L18.8415 2.02801L18.8333 2.03288L18.8301 2.03774L18.8252 2.04098L18.8204 2.04422L18.8171 2.04909L18.8139 2.05395L18.809 2.05719L18.8041 2.06043L18.8009 2.06529L18.7977 2.07016L18.7928 2.0734L18.7847 2.08961L18.7765 2.10582L18.7717 2.10906C18.7695 2.1123 18.7008 2.20414 18.5655 2.3846C18.4303 2.56613 18.3572 2.65797 18.3464 2.66014C18.3356 2.66338 18.3205 2.67959 18.301 2.70877C18.2826 2.73901 18.1679 2.85951 17.9569 3.07022C17.7459 3.28092 17.5392 3.46839 17.3369 3.63265C17.1335 3.79797 17.0307 4.00111 17.0285 4.24208C17.0252 4.48197 17.0128 4.7532 16.9911 5.05575C16.9695 5.35831 16.9289 5.68517 16.8694 6.03635C16.8099 6.38754 16.7179 6.78465 16.5935 7.22767C16.4691 7.6707 16.3176 8.10293 16.139 8.52435C15.9605 8.94576 15.7738 9.32395 15.5791 9.65893C15.3843 9.99391 15.2058 10.2776 15.0434 10.5099C14.8811 10.7422 14.7161 10.961 14.5484 11.1663C14.3807 11.3716 14.1686 11.6029 13.9122 11.86C13.6546 12.1161 13.514 12.2566 13.4902 12.2815C13.4653 12.3052 13.3593 12.3938 13.172 12.5473C12.9859 12.7018 12.7857 12.8563 12.5715 13.0108C12.3583 13.1643 12.1625 13.2923 11.9839 13.395C11.8054 13.4976 11.5901 13.6149 11.3379 13.7467C11.0869 13.8796 10.8153 14.0028 10.5232 14.1162C10.231 14.2297 9.92262 14.3351 9.598 14.4323C9.27338 14.5296 8.95959 14.6052 8.65661 14.6592C8.35365 14.7133 8.01009 14.7592 7.62595 14.797L7.04976 14.8537V14.8618H5.99475V14.8537L5.85679 14.8456C5.76483 14.8402 5.68908 14.8348 5.62956 14.8294C5.57006 14.824 5.34552 14.7943 4.95598 14.7403C4.56644 14.6862 4.26077 14.6322 4.03894 14.5782C3.81713 14.5242 3.48709 14.4215 3.04886 14.2702C2.61062 14.119 2.23569 13.966 1.92406 13.8115C1.61352 13.6581 1.41875 13.5608 1.33975 13.5198C1.26184 13.4798 1.1742 13.4301 1.07681 13.3707L0.930733 13.2815L0.927503 13.2767L0.922618 13.2734L0.917748 13.2702L0.914502 13.2653L0.898271 13.2572L0.882041 13.2491L0.878811 13.2442L0.873925 13.241L0.869056 13.2378L0.86581 13.2329L0.86258 13.228L0.857694 13.2248H0.849579V13.1924L0.86581 13.1956L0.882041 13.2005L0.955079 13.2086C1.00377 13.214 1.13633 13.2221 1.35273 13.2329C1.56916 13.2437 1.79908 13.2437 2.04255 13.2329C2.28601 13.2221 2.53489 13.1978 2.78916 13.1599C3.04345 13.1221 3.34372 13.0573 3.68998 12.9654C4.03624 12.8736 4.35437 12.7645 4.64437 12.638C4.93327 12.5105 5.13885 12.4154 5.26114 12.3528C5.38232 12.2912 5.56735 12.1766 5.81622 12.0092L6.18952 11.7579L6.19277 11.7531L6.19764 11.7498L6.20253 11.7466L6.20576 11.7417L6.209 11.7369L6.21387 11.7336L6.21876 11.7304L6.22199 11.7255L6.23822 11.7206L6.25445 11.7174L6.25769 11.7012L6.26256 11.685L6.26745 11.6817L6.27068 11.6769L6.14083 11.6688C6.05427 11.6634 5.97041 11.658 5.88925 11.6526C5.8081 11.6472 5.68096 11.6229 5.50783 11.5796C5.33471 11.5364 5.14806 11.4716 4.94787 11.3851C4.74769 11.2987 4.55292 11.196 4.36356 11.0772C4.17421 10.9583 4.03732 10.8594 3.95292 10.7806C3.8696 10.7027 3.76139 10.5925 3.6283 10.4499C3.49629 10.3062 3.38159 10.1587 3.2842 10.0074C3.18682 9.85614 3.09377 9.68161 3.00505 9.48388L2.87032 9.18889L2.8622 9.16458L2.85409 9.14026L2.84922 9.12406L2.84597 9.10785L2.87032 9.11109L2.89466 9.11595L3.0732 9.14026C3.19224 9.15647 3.3789 9.16187 3.63317 9.15647C3.88746 9.15108 4.06328 9.14026 4.16067 9.12406C4.25805 9.10785 4.31757 9.09704 4.33921 9.09164L4.37167 9.08354L4.41225 9.07543L4.45283 9.06733L4.45607 9.06246L4.46094 9.05922L4.46583 9.05598L4.46906 9.05112L4.43659 9.04301L4.40413 9.03491L4.37167 9.02681L4.33921 9.0187L4.30675 9.0106C4.28511 9.0052 4.24725 8.99439 4.19313 8.97818C4.13903 8.96197 3.99296 8.90254 3.7549 8.79989C3.51686 8.69724 3.32749 8.59728 3.18682 8.50003C3.0458 8.4025 2.91133 8.29584 2.78429 8.18073C2.65769 8.06403 2.51866 7.91382 2.36716 7.73013C2.21568 7.54644 2.08043 7.33303 1.96139 7.0899C1.84237 6.84677 1.7531 6.61446 1.69358 6.39294C1.6343 6.17272 1.59519 5.94758 1.57674 5.72029L1.5475 5.37991L1.56374 5.38316L1.57997 5.38802L1.5962 5.39612L1.61243 5.40423L1.62866 5.41233L1.64489 5.42043L1.89647 5.53389C2.0642 5.60954 2.27249 5.67437 2.52136 5.72839C2.77024 5.78242 2.91901 5.81214 2.9677 5.81754L3.04074 5.82564H3.18682L3.18359 5.82078L3.1787 5.81754L3.17383 5.8143L3.17059 5.80944L3.16736 5.80457L3.16247 5.80133L3.1576 5.79809L3.15436 5.79323L3.13813 5.78512L3.1219 5.77702L3.11867 5.77216L3.11378 5.76892L3.10891 5.76567L3.10567 5.76081L3.08943 5.75271L3.0732 5.7446L3.06997 5.73974C3.06673 5.73757 3.02019 5.703 2.93037 5.63601C2.84164 5.56793 2.74859 5.47987 2.6512 5.37181C2.55382 5.26375 2.45643 5.15029 2.35905 5.03143C2.26148 4.9123 2.17458 4.78485 2.09935 4.65054C2.02362 4.51547 1.94354 4.34365 1.85914 4.13511C1.77582 3.92764 1.71252 3.71855 1.66924 3.50784C1.62596 3.29713 1.60162 3.08913 1.5962 2.88382C1.59079 2.67851 1.5962 2.50292 1.61243 2.35705C1.62866 2.21117 1.66112 2.04638 1.70981 1.86269C1.75851 1.679 1.82885 1.4845 1.92081 1.27919L2.05878 0.971227L2.06689 0.946914L2.07501 0.922601L2.07989 0.91936L2.08312 0.914497L2.08637 0.909635L2.09124 0.906393L2.09612 0.909635L2.09935 0.914497L2.1026 0.91936L2.10747 0.922601L2.11235 0.925843L2.11558 0.930706L2.11883 0.935568L2.1237 0.93881L2.13182 0.955018L2.13993 0.971227L2.14482 0.974468L2.14805 0.979331L2.36716 1.22246C2.51324 1.38454 2.68637 1.56554 2.88655 1.76544C3.08674 1.96534 3.19765 2.06907 3.21928 2.07664C3.24093 2.08528 3.26797 2.11013 3.30044 2.1512C3.3329 2.19118 3.44111 2.28681 3.62505 2.43809C3.80901 2.58936 4.04976 2.76496 4.34732 2.96486C4.6449 3.16476 4.97492 3.36197 5.33741 3.55647C5.69991 3.75097 6.08945 3.92655 6.50603 4.08324C6.92262 4.23993 7.21478 4.34258 7.38249 4.3912C7.55022 4.43983 7.83695 4.50195 8.24273 4.5776C8.6485 4.65324 8.95419 4.70187 9.15977 4.72347C9.36536 4.74508 9.50604 4.75751 9.58177 4.76075L9.69539 4.76399L9.69216 4.73968L9.68727 4.71537L9.65481 4.51276C9.63317 4.3777 9.62235 4.1886 9.62235 3.94547C9.62235 3.70234 9.64129 3.47813 9.67916 3.27282C9.71704 3.06751 9.77385 2.85951 9.84958 2.6488C9.92533 2.43809 9.99945 2.26897 10.0719 2.14147C10.1455 2.01505 10.2418 1.87079 10.3609 1.70871C10.4799 1.54663 10.6341 1.37914 10.8234 1.20625C11.0128 1.03335 11.2292 0.879374 11.4727 0.744309C11.7161 0.609244 11.9407 0.50658 12.1462 0.436349C12.3518 0.366118 12.525 0.320183 12.6656 0.298578C12.8063 0.276972 12.8766 0.26454 12.8766 0.261298Z" />
      </svg>
    ),
    href: "https://twitter.com/AdhithyaSarath",
  },
  {
    Logo: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        className="-mt-1 w-6 h-6 stroke-foreground !fill-foreground"
      >
        <path d="M0.849625 3.47987C0.849625 2.90265 1.05233 2.42646 1.45773 2.0513C1.86313 1.67611 2.39017 1.48853 3.03881 1.48853C3.67589 1.48853 4.19132 1.67322 4.58515 2.04264C4.99055 2.42359 5.19325 2.91997 5.19325 3.53181C5.19325 4.08593 4.99635 4.54768 4.60252 4.9171C4.19712 5.29805 3.6643 5.48852 3.00406 5.48852H2.98669C2.34962 5.48852 1.83419 5.29805 1.44036 4.9171C1.04653 4.53614 0.849625 4.05706 0.849625 3.47987ZM1.07549 18.6314V7.06428H4.93264V18.6314H1.07549ZM7.0697 18.6314H10.9268V12.1725C10.9268 11.7685 10.9732 11.4568 11.0658 11.2374C11.228 10.8449 11.4741 10.513 11.8043 10.2418C12.1344 9.97048 12.5485 9.83484 13.0465 9.83484C14.3438 9.83484 14.9925 10.7064 14.9925 12.4496V18.6314H18.8496V11.9993C18.8496 10.2908 18.4442 8.99502 17.6334 8.1119C16.8226 7.22878 15.7512 6.78722 14.4191 6.78722C12.9249 6.78722 11.7608 7.42792 10.9268 8.7093V8.74393H10.9095L10.9268 8.7093V7.06428H7.0697C7.09286 7.43368 7.10445 8.58231 7.10445 10.5102C7.10445 12.438 7.09286 15.1451 7.0697 18.6314Z" />
      </svg>
    ),
    href: "https://www.linkedin.com/in/sarath-adhithya/",
  },
];
