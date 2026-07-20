import type { Metadata } from "next";
import LegalPage from "../../components/common/LegalPage";

export const metadata: Metadata = {
  title: "Size Guide — Genesis by Preethy",
  description:
    "Body measurements in inches and fit notes to help you choose the right Genesis by Preethy size.",
};

export default function SizeGuidePage() {
  return (
    <LegalPage eyebrow="Customer Care" title="Size Guide">
      <p>
        Our clothing is drafted for real bodies and tropical weather, with room to
        move and breathe. The chart below lists body measurements, not garment
        measurements. Measure yourself over light clothing and pick the size that
        matches your largest reading.
      </p>

      <h2>Body measurements (inches)</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Size</th>
            <th scope="col">Bust</th>
            <th scope="col">Waist</th>
            <th scope="col">Hip</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>XS</td>
            <td>32 – 33</td>
            <td>25 – 26</td>
            <td>35 – 36</td>
          </tr>
          <tr>
            <td>S</td>
            <td>34 – 35</td>
            <td>27 – 28</td>
            <td>37 – 38</td>
          </tr>
          <tr>
            <td>M</td>
            <td>36 – 37</td>
            <td>29 – 30</td>
            <td>39 – 40</td>
          </tr>
          <tr>
            <td>L</td>
            <td>38 – 40</td>
            <td>31 – 33</td>
            <td>41 – 43</td>
          </tr>
          <tr>
            <td>XL</td>
            <td>41 – 43</td>
            <td>34 – 36</td>
            <td>44 – 46</td>
          </tr>
          <tr>
            <td>XXL</td>
            <td>44 – 46</td>
            <td>37 – 39</td>
            <td>47 – 49</td>
          </tr>
        </tbody>
      </table>

      <h2>How to measure</h2>
      <ul>
        <li>
          Bust: around the fullest part of your chest, tape level and not pulled
          tight.
        </li>
        <li>Waist: around the narrowest part of your torso, above the navel.</li>
        <li>Hip: around the fullest part of your seat, feet together.</li>
      </ul>

      <h2>Fit notes</h2>
      <ul>
        <li>
          Most of our silhouettes are relaxed and drape away from the body. If you
          are between sizes and prefer a closer fit, size down.
        </li>
        <li>
          Structured pieces such as shirt-dresses run truer to the chart; follow
          your bust reading for these.
        </li>
        <li>
          Natural fabrics like cotton and linen may relax by half a size with wear
          and settle back after a wash.
        </li>
        <li>
          Each product page carries its own fit note and the height of the model
          in the photographs for reference.
        </li>
      </ul>

      <h2>Still unsure?</h2>
      <p>
        Share your measurements with us on WhatsApp and we will recommend a size.
        We would rather help you get it right the first time than process an
        exchange later.
      </p>
    </LegalPage>
  );
}
