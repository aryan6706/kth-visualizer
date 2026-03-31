import { useState, useEffect } from "react";

function quickSelect(arr, k, steps) {
  if (arr.length === 1) {
    steps.push({
      arr: [...arr],
      pivot: arr[0],
      left: [],
      right: [],
      explanation: `🎉 Only one element left (${arr[0]}).\nSo this must be the answer!`
    });
    return arr[0];
  }

  const pivot = arr[arr.length - 1];
  const left = arr.filter(x => x < pivot);
  const equal = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  let explanation = `
Let's understand this step clearly:

━━━━━━━━━━━━━━━━━━━

Goal:
We want to find the ${k}th smallest number
WITHOUT sorting the whole array (this makes it faster)

━━━━━━━━━━━━━━━━━━━

Step 1: Pick a Pivot
We choose one number from the array called the "pivot".
Pivot = ${pivot}

Think of the pivot like a divider that helps us split the array.

━━━━━━━━━━━━━━━━━━━

Step 2: Split the Array
Now we compare EVERY number with the pivot:

LEFT (numbers smaller than ${pivot}):
[${left.join(", ") || "None"}]

EQUAL (numbers equal to ${pivot}):
[${equal.join(", ") || "None"}]

RIGHT (numbers greater than ${pivot}):
[${right.join(", ") || "None"}]

After this step, we clearly know where each number belongs.

━━━━━━━━━━━━━━━━━━━

Step 3: Think about the answer
We are looking for the ${k}th smallest number.

Count how many numbers are smaller than pivot:
There are ${left.length} numbers in LEFT.

Count how many numbers are equal to pivot:
There are ${equal.length} numbers equal to pivot.

━━━━━━━━━━━━━━━━━━━

Step 4: Decide where the answer is
Now we decide which side contains our answer:
`;

  if (k <= left.length) {
    explanation += `
${left.length} elements are smaller than ${pivot}

So answer lies in LEFT

-> Move to LEFT
`;
    steps.push({ arr: [...arr], pivot, left, right, explanation });
    return quickSelect(left, k, steps);

  } else if (k <= left.length + equal.length) {
    explanation += `
FOUND:

${pivot} is the ${k}th smallest element.

Final Answer: ${pivot}
`;
    steps.push({ arr: [...arr], pivot, left, right, explanation });
    return pivot;

  } else {
    const newK = k - left.length - equal.length;

    explanation += `
Skip ${left.length + equal.length} elements

Now search ${newK}th smallest in RIGHT

-> Move to RIGHT
`;
    steps.push({ arr: [...arr], pivot, left, right, explanation });
    return quickSelect(right, newK, steps);
  }
}

export default function App() {
  const generateRandomArray = () => {
    const size = Math.floor(Math.random() * 5) + 5; // 5 to 9 elements
    return Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1).join(",");
  };
  const [input, setInput] = useState(() => generateRandomArray());
  const [k, setK] = useState(1);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // ✅ NEW: speed state (default = 1200ms)
  const [speed, setSpeed] = useState(1200);

  // Randomize k whenever input changes (including initial load)
  useEffect(() => {
    const arr = input.split(",").map(Number);
    if (arr.length > 0) {
      const randomK = Math.floor(Math.random() * arr.length) + 1;
      setK(randomK);
    }
  }, [input]);

  // New states for Learn Mode
  const [learnMode, setLearnMode] = useState(false);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [feedback, setFeedback] = useState("");

  // NEW: algorithm state
  const [algorithm, setAlgorithm] = useState("quickselect");

  // NEW states for quiz system
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const [history, setHistory] = useState([]);

  const handleRun = () => {
    const arr = input.split(",").map(Number);
    const stepLog = [];
    let res;
    if (algorithm === "quickselect") {
      res = quickSelect(arr, k, stepLog);
    } else {
      const sorted = [...arr].sort((a, b) => a - b);
      res = sorted[k - 1];

      stepLog.push({
        arr: [...arr],
        pivot: "-",
        left: [],
        right: [],
        explanation: `Sorting Approach:

We sort the array:
[${sorted.join(", ")}]

Now pick the ${k}th element -> ${res}

Time Complexity: O(n log n)

QuickSelect is faster on average: O(n)`
      });
    }
    setSteps(stepLog);
    setResult(res);
    setCurrentStep(0);
    setPlaying(false);
  };

  // Helper function for Learn Mode quiz correctness
  const getCorrectDirection = (step) => {
    const leftLen = step.left.length;
    const equalLen = step.arr.filter(x => x === step.pivot).length;

    if (k <= leftLen) return "left";
    else if (k <= leftLen + equalLen) return "pivot";
    else return "right";
  };

  // ✅ UPDATED: use dynamic speed and pause autoplay in Learn Mode
  useEffect(() => {
    if (playing && currentStep < steps.length - 1 && !learnMode) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [playing, currentStep, steps, speed, learnMode]);

  const step = steps[currentStep];

  // Bar visualization constants
  const MAX_BAR_HEIGHT = 180;
  const CAP_VALUE = 50; // values above this will be capped visually

  // Style helpers for new design
  const controlBtn = {
    background: "#334155",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    minWidth: "90px",
    transition: "background 0.2s"
  };
  const speedBtn = (active) => ({
    background: active ? "#facc15" : "#334155",
    color: active ? "#18181b" : "white",
    border: "none",
    borderRadius: "8px",
    padding: "7px 18px",
    margin: "0 3px",
    fontWeight: "bold",
    cursor: "pointer"
  });

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      background: "linear-gradient(to bottom, #020617, #0f172a)",
      color: "white",
      padding: "20px",
      fontFamily: "system-ui",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: "bold" }}>
          Kth Smallest Visualizer
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Using {algorithm === "quickselect" ? "QuickSelect" : "Sorting"}
        </p>
      </div>

      <div style={{
        background: "rgba(30,41,59,0.6)",
        padding: "20px",
        borderRadius: "12px",
        backdropFilter: "blur(10px)",
        width: "100%",
        maxWidth: "800px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        <div style={{ marginBottom: "15px", textAlign: "center" }}>
          <label style={{ marginRight: "10px" }}>Algorithm:</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px" }}
          >
            <option value="quickselect">QuickSelect (Optimal)</option>
            <option value="sorting">Sorting (Simple)</option>
          </select>
        </div>
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", border: "none", width: "100%", maxWidth: "400px" }}
          />
          <input
            type="number"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            style={{ padding: "10px", borderRadius: "8px", border: "none", width: "100px" }}
          />
          <button
            onClick={handleRun}
            style={{ background: "#22c55e", border: "none", borderRadius: "8px", padding: "10px 16px", fontWeight: "bold", cursor: "pointer" }}
          >
            Run
          </button>
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "25px" }}>
        Result: <span style={{ color: "#22c55e" }}>{result}</span>
      </h2>

      {steps.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
          <button onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))} style={controlBtn}>⏮ Prev</button>
          <button onClick={() => setPlaying(!playing)} style={{ ...controlBtn, background: playing ? "#ef4444" : "#3b82f6" }}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => {
              if (learnMode) {
                setAwaitingAnswer(true);
                setPlaying(false);
              } else {
                setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
              }
            }}
            style={controlBtn}
          >
            Next ⏭
          </button>
          <button
            onClick={() => setLearnMode(!learnMode)}
            style={{ ...controlBtn, background: learnMode ? "#a855f7" : "#334155" }}
          >
            {learnMode ? "Learn Mode ON" : "Learn Mode OFF"}
          </button>
        </div>
      )}

      {steps.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <span style={{ marginRight: "10px" }}>Speed:</span>
          <button onClick={() => setSpeed(2000)} style={speedBtn(speed === 2000)}>Slow</button>
          <button onClick={() => setSpeed(1200)} style={speedBtn(speed === 1200)}>Normal</button>
          <button onClick={() => setSpeed(500)} style={speedBtn(speed === 500)}>Fast</button>
        </div>
      )}

      {awaitingAnswer && step && (
        <div style={{
          marginTop: "30px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center"
        }}>

          <h3>Quiz Mode ({difficulty.toUpperCase()})</h3>

          <div style={{ marginBottom: "10px" }}>
            <strong>Score:</strong> {score} | <strong>Streak:</strong> {streak}
          </div>

          {/* Difficulty Selector */}
          <div style={{ marginBottom: "15px" }}>
            <span>Difficulty: </span>
            {["easy", "medium", "hard"].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  margin: "0 5px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: difficulty === d ? "#facc15" : "#334155",
                  color: difficulty === d ? "black" : "white",
                  cursor: "pointer"
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Dynamic Question */}
          <p>
            {difficulty === "easy" && `Where will we go next? (Left / Pivot / Right)`}
            {difficulty === "medium" && `How many elements are smaller than pivot ${step.pivot}?`}
            {difficulty === "hard" && `What will be the next k value after this step?`}
          </p>

          {/* Answer Buttons */}
          <div style={{ marginTop: "15px" }}>

            {difficulty === "easy" && ["left", "pivot", "right"].map(choice => (
              <button key={choice} style={{ ...controlBtn, margin: "5px" }}
                onClick={() => {
                  const correct = getCorrectDirection(step);
                  const isCorrect = choice === correct;

                  if (isCorrect) {
                    setScore(s => s + 10);
                    setStreak(s => s + 1);
                    setFeedback("Correct!");
                  } else {
                    setStreak(0);
                    setFeedback(
                      `Incorrect.\n\nExplanation:\nWe compare k with the number of elements smaller than pivot (${step.left.length}) and equal to pivot (${step.arr.filter(x => x === step.pivot).length}).\n\nIf k ≤ left count → go LEFT\nIf k is within left + equal → pivot is answer\nOtherwise → go RIGHT\n\nCorrect direction: ${correct.toUpperCase()}`
                    );
                  }

                  setHistory(prev => [...prev, { difficulty, correct: isCorrect }]);

                  setTimeout(() => {
                    setAwaitingAnswer(false);
                    setFeedback("");
                    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
                  }, 1200);
                }}
              >{choice.toUpperCase()}</button>
            ))}

            {difficulty === "medium" && (
              <input
                type="number"
                placeholder="Enter count"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const correct = step.left.length;
                    const user = Number(e.target.value);

                    const isCorrect = user === correct;

                    if (isCorrect) {
                      setScore(s => s + 15);
                      setStreak(s => s + 1);
                      setFeedback("Correct!");
                    } else {
                      setStreak(0);
                      setFeedback(
                        `Incorrect.\n\nExplanation:\nTo find how many elements are smaller than pivot (${step.pivot}), count elements in LEFT.\n\nLEFT contains: [${step.left.join(", ") || "None"}]\n\nSo the correct count is ${correct}.`
                      );
                    }

                    setHistory(prev => [...prev, { difficulty, correct: isCorrect }]);

                    setTimeout(() => {
                      setAwaitingAnswer(false);
                      setFeedback("");
                      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
                    }, 1200);
                  }
                }}
                style={{ padding: "8px", borderRadius: "6px" }}
              />
            )}

            {difficulty === "hard" && (
              <input
                type="number"
                placeholder="Enter new k"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const leftLen = step.left.length;
                    const equalLen = step.arr.filter(x => x === step.pivot).length;
                    let correct;

                    if (k <= leftLen) correct = k;
                    else if (k <= leftLen + equalLen) correct = k;
                    else correct = k - leftLen - equalLen;

                    const user = Number(e.target.value);
                    const isCorrect = user === correct;

                    if (isCorrect) {
                      setScore(s => s + 25);
                      setStreak(s => s + 1);
                      setFeedback("Correct!");
                    } else {
                      setStreak(0);
                      setFeedback(
                        `Incorrect.\n\nExplanation:\nWe update k based on which part we move to.\n\nIf we go LEFT → k stays same\nIf pivot is answer → k unchanged\nIf we go RIGHT → subtract elements in LEFT and EQUAL\n\nNew k = k - (left count + equal count)\n= ${k} - (${step.left.length} + ${step.arr.filter(x => x === step.pivot).length})\n= ${correct}`
                      );
                    }

                    setHistory(prev => [...prev, { difficulty, correct: isCorrect }]);

                    setTimeout(() => {
                      setAwaitingAnswer(false);
                      setFeedback("");
                      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
                    }, 1500);
                  }
                }}
                style={{ padding: "8px", borderRadius: "6px" }}
              />
            )}

          </div>

          {feedback && (
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>{feedback}</p>
          )}

          {/* History Insight */}
          {history.length > 0 && (
            <p style={{ marginTop: "10px", color: "#94a3b8" }}>
              Accuracy: {Math.round((history.filter(h => h.correct).length / history.length) * 100)}%
            </p>
          )}

        </div>
      )}

      {step && (
        <div style={{
          marginTop: "40px",
          width: "100%",
          maxWidth: "1000px",
          background: "rgba(30,41,59,0.6)",
          padding: "20px",
          borderRadius: "14px",
          backdropFilter: "blur(12px)"
        }}>

          <h3 style={{ color: "#facc15", textAlign: "center" }}>
            Step {currentStep + 1} / {steps.length}
          </h3>

          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "end",
            height: "220px",
            gap: "10px",
            marginTop: "20px",
            width: "100%",
            overflowX: "auto",
            paddingBottom: "10px"
          }}>
            {step.arr.map((num, idx) => {
              const maxVal = Math.max(...step.arr);
              const displayMax = Math.min(maxVal, CAP_VALUE);
              const scale = MAX_BAR_HEIGHT / displayMax;

              let height = num > displayMax ? MAX_BAR_HEIGHT : num * scale;

              let color = "#64748b";

              // Priority 1: Pivot (always highest priority)
              if (num === step.pivot) {
                color = "#facc15";
              }
              // Priority 2: Overflow (only if NOT pivot)
              else if (num > displayMax) {
                color = "#a855f7";
              }
              // Priority 3: Left
              else if (step.left.includes(num)) {
                color = "#22c55e";
              }
              // Priority 4: Right
              else if (step.right.includes(num)) {
                color = "#ef4444";
              }

              return (
                <div key={idx} style={{
                  width: "min(45px, 8vw)",
                  height: `${height}px`,
                  background: color,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}>
                  {num}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <span style={{ marginRight: "10px" }}>Legend:</span>

            <span style={{ margin: "0 8px", color: "#22c55e" }}>⬤ Left</span>
            <span style={{ margin: "0 8px", color: "#ef4444" }}>⬤ Right</span>
            <span style={{ margin: "0 8px", color: "#facc15" }}>⬤ Pivot</span>
            <span style={{ margin: "0 8px", color: "#a855f7" }}>⬤ Overflow</span>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p><strong>Pivot:</strong> <span style={{ color: "#facc15" }}>{step.pivot}</span></p>
            <p><strong>Left:</strong> {step.left.length ? step.left.join(", ") : "None"}</p>
            <p><strong>Right:</strong> {step.right.length ? step.right.join(", ") : "None"}</p>
          </div>

          <div style={{ background: "#020617", padding: "18px", borderRadius: "10px", marginTop: "20px", whiteSpace: "pre-line" }}>
            <p style={{ color: "#38bdf8" }}>{step.explanation}</p>
          </div>

        </div>
      )}
    </div>
  );
}